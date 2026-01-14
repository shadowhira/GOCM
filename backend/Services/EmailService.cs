using Common.Exceptions;
using Microsoft.Extensions.Options;
using OnlineClassroomManagement.Helper.Options;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace OnlineClassroomManagement.Services
{
    public interface IEmailService
    {
        Task SendResetPasswordEmailAsync(string toEmail, string resetLink);
        Task SendEmail2MultipleRecipients(string subject, string htmlContent, List<string> toEmails);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendEmail2MultipleRecipients(string subject, string htmlContent, List<string> toEmails)
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                _logger.LogError("SendGrid API key is not configured. Unable to send email to {Email}", string.Join(", ", toEmails));
                throw new CustomException(ExceptionCode.InternalServerError, ("Email service is not configured correctly."));
            }

            SendGridClient client = new(_settings.ApiKey);
            EmailAddress from = new(_settings.SenderEmail, _settings.SenderName);

            SendGridMessage message = new()
            {
                From = from,
                Subject = subject,
                HtmlContent = htmlContent,
                Personalizations = new List<Personalization>()
                {
                    new Personalization
                    {
                        Tos = toEmails.Select(email => new EmailAddress(email)).ToList()
                    }
                }
            };
            Response res = await client.SendEmailAsync(message);
        }

        public async Task SendResetPasswordEmailAsync(string toEmail, string resetLink)
        {
            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                _logger.LogError("SendGrid API key is not configured. Unable to send email to {Email}", toEmail);
                throw new InvalidOperationException("Email service is not configured correctly.");
            }

            SendGridClient client = new(_settings.ApiKey);
            EmailAddress from = new(_settings.SenderEmail, _settings.SenderName);
            EmailAddress to = new(toEmail);
            const string subject = "Đặt lại mật khẩu";
            string plainTextContent =
                "Xin chào,\n\nSử dụng liên kết sau để đặt lại mật khẩu: " + resetLink +
                "\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.";
            string htmlContent =
                $"<p>Xin chào,</p><p>Bấm vào liên kết bên dưới để đặt lại mật khẩu cho tài khoản của bạn:</p><p><a href=\"{resetLink}\">{resetLink}</a></p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>";

            SendGridMessage message = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);

            try
            {
                Response response = await client.SendEmailAsync(message);
                if (!response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Body.ReadAsStringAsync();
                    _logger.LogError("Failed to send reset password email to {Email}. Status: {StatusCode}. Response: {Body}",
                        toEmail,
                        response.StatusCode,
                        responseBody);
                    throw new InvalidOperationException("Unable to send reset password email.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send reset password email to {Email}", toEmail);
                throw;
            }
        }
    }
}
