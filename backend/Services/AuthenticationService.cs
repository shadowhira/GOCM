using AutoMapper;
using Common.Exceptions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Helper.Options;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.Authentications;
using OnlineClassroomManagement.Models.Responses.Authentications;
using OnlineClassroomManagement.Models.Responses.Users;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IAuthenticationService
    {
        Task<RegisterResponse> RegisterUser(RegisterRequest request);
        Task<LoginResponse> ValidateUser(LoginRequest request);
        Task RequestPasswordResetAsync(ForgotPasswordRequest request);
        Task ResetPasswordAsync(ResetPasswordRequest request);
    }

    public class AuthenticationService : IAuthenticationService
    {
        private readonly IConfiguration _configuration;
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;
        private readonly PasswordResetOptions _passwordResetOptions;
        private readonly ILogger<AuthenticationService> _logger;
        private readonly IHostEnvironment _environment;

        public AuthenticationService(
            IRepository repository,
            IMapper mapper,
            IConfiguration configuration,
            IEmailService emailService,
            INotificationService notificationService,
            IOptions<PasswordResetOptions> passwordResetOptions,
            ILogger<AuthenticationService> logger,
            IHostEnvironment environment)
        {
            _repository = repository;
            _mapper = mapper;
            _configuration = configuration;
            _emailService = emailService;
            _notificationService = notificationService;
            _passwordResetOptions = passwordResetOptions.Value;
            _logger = logger;
            _environment = environment;
        }

        public async Task<RegisterResponse> RegisterUser(RegisterRequest request)
        {
            // Validate input
            if (string.IsNullOrEmpty(request.Email))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Email không được để trống!");
            }

            if (string.IsNullOrEmpty(request.Password))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Mật khẩu không được để trống!");
            }

            if (string.IsNullOrEmpty(request.DisplayName))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Tên hiển thị không được để trống!");
            }

            // Check if user already exists
            User? existingUser = await _repository.GetAsync<User>(e => e.Email == request.Email);
            if (existingUser != null)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Email đã được sử dụng!");
            }

            // Create new user
            User newUser = new User
            {
                Email = request.Email,
                Password = request.Password,
                DisplayName = request.DisplayName,
                AvatarUrl = string.Empty,
                Role = Role.User // Default role
            };

            await _repository.AddAsync(newUser);
            await _repository.SaveChangesAsync();

            // Welcome notification (system-style)
            await _notificationService.CreateNotification(new CreateNotificationRequest
            {
                Type = "system_welcome",
                Data = new Dictionary<string, string>
                {
                    { "userName", newUser.DisplayName ?? string.Empty }
                },
                SenderId = newUser.Id,
                ReceiverIds = new List<int> { newUser.Id },
                LinkRedirect = "/",
                OpenNewTab = false,
                NeedSendEmail = false
            });

            RegisterResponse response = new RegisterResponse
            {
                Message = "Đăng ký thành công!",
                Token = await CreateToken(newUser), // Đăng nhập luôn sau khi đăng ký
                User = _mapper.Map<UserResponse>(newUser)
            };

            return response;
        }

        public async Task<LoginResponse> ValidateUser(LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Email không được để trống!");
            }

            if (string.IsNullOrEmpty(request.Password))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Mật khẩu không được để trống!");
            }

            User? user = await _repository.GetAsync<User>(e => e.Email == request.Email);

            if (user == null || !string.Equals(user.Password, request.Password, StringComparison.Ordinal))
            {
                throw new CustomException(ExceptionCode.LoginFailed, "Sai email hoặc mật khẩu!");
            }

            LoginResponse response = new();
            response.User = _mapper.Map<UserResponse>(user);
            response.Token = await CreateToken(user);
            return response;
        }

        public async Task RequestPasswordResetAsync(ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Email không được để trống!");
            }

            User? user = await _repository.GetAsync<User>(e => e.Email == request.Email);

            if (user == null)
            {
                _logger.LogInformation("Password reset requested for non-existing email {Email}", request.Email);
                return;
            }

            string token = GeneratePasswordResetToken(user);
            string resetUrl = BuildResetUrl(token);
            await _emailService.SendResetPasswordEmailAsync(user.Email, resetUrl);
        }

        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Token không hợp lệ!");
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Mật khẩu mới không được để trống!");
            }

            JwtSecurityToken rawToken;
            try
            {
                rawToken = new JwtSecurityTokenHandler().ReadJwtToken(request.Token);
            }
            catch (Exception)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Token đặt lại mật khẩu không hợp lệ!");
            }

            string? sub = rawToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            if (!int.TryParse(sub, out int userId))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Token đặt lại mật khẩu không hợp lệ!");
            }

            User? user = await _repository.GetByIdAsync<User>(userId);
            if (user == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Người dùng không tồn tại!");
            }

            try
            {
                ValidateResetToken(request.Token, user.Password);
            }
            catch (SecurityTokenException)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!");
            }

            user.Password = request.NewPassword;
            _repository.Update(user);
            await _repository.SaveChangesAsync();
        }
        private async Task<string> CreateToken(User user)
        {
            SigningCredentials signingCredentials = GetSigningCredentials();
            List<Claim> claims = await GetClaims(user);
            JwtSecurityToken tokenOptions = GenerateTokenOptions(signingCredentials, claims);
            return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
        }
        private SigningCredentials GetSigningCredentials()
        {
            IConfigurationSection jwtSettings = _configuration.GetSection("JwtSettings"); // <- come from IConfiguration service
            byte[] key = Encoding.UTF8.GetBytes(jwtSettings["key"]);
            SymmetricSecurityKey secret = new SymmetricSecurityKey(key);
            return new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);
        }
        // Claims các thông tin (dữ liệu) được mã hóa bên trong token để mô tả về người dùng hoặc về ngữ cảnh xác thực/ủy quyền.
        private async Task<List<Claim>> GetClaims(User user)
        {
            List<Claim> claims = new()
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString())
            };

            return claims;
        }
        private JwtSecurityToken GenerateTokenOptions(SigningCredentials signingCredentials,
        List<Claim> claims)
        {
            IConfigurationSection jwtSettings = _configuration.GetSection("JwtSettings");
            JwtSecurityToken tokenOptions = new JwtSecurityToken
            (
                issuer: jwtSettings["validIssuer"],
                audience: jwtSettings["validAudience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["expires"])),
                signingCredentials: signingCredentials
            );
            return tokenOptions;
        }

        private string GeneratePasswordResetToken(User user)
        {
            SigningCredentials credentials = new SigningCredentials(BuildResetSecret(user.Password), SecurityAlgorithms.HmacSha256);

            List<Claim> claims = new()
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            JwtSecurityToken token = new JwtSecurityToken(
                issuer: _passwordResetOptions.Issuer,
                audience: _passwordResetOptions.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_passwordResetOptions.TokenLifetimeMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private void ValidateResetToken(string token, string currentPassword)
        {
            TokenValidationParameters validationParameters = new()
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = BuildResetSecret(currentPassword),
                ValidateIssuer = true,
                ValidIssuer = _passwordResetOptions.Issuer,
                ValidateAudience = true,
                ValidAudience = _passwordResetOptions.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1)
            };

            JwtSecurityTokenHandler handler = new();
            handler.ValidateToken(token, validationParameters, out _);
        }

        private SymmetricSecurityKey BuildResetSecret(string passwordSecretSource)
        {
            string? appSecret = _configuration.GetSection("JwtSettings")["Key"];
            if (string.IsNullOrWhiteSpace(appSecret))
            {
                throw new CustomException(ExceptionCode.InternalServerError, "JwtSettings:Key chưa được cấu hình!");
            }

            byte[] combined = Encoding.UTF8.GetBytes($"{appSecret}:{passwordSecretSource}");
            byte[] hashedKey = SHA256.HashData(combined);
            return new SymmetricSecurityKey(hashedKey);
        }

        private string BuildResetUrl(string token)
        {
            string baseUrl = ResolveResetBaseUrl();
            Console.WriteLine($"Base URL: {baseUrl}");

            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                throw new CustomException(ExceptionCode.InternalServerError, "URL đặt lại mật khẩu chưa được cấu hình!");
            }

            string separator = baseUrl.Contains('?') ? "&" : "?";
            return $"{baseUrl}{separator}token={Uri.EscapeDataString(token)}";
        }

        private string ResolveResetBaseUrl()
        {
            Console.WriteLine($"Is Production: {_environment.IsProduction()}");

            if (_environment.IsProduction() &&
                !string.IsNullOrWhiteSpace(_passwordResetOptions.ProductionBaseUrl))
            {
                return _passwordResetOptions.ProductionBaseUrl;
            }

            return _passwordResetOptions.BaseUrl;
        }
    }
}
