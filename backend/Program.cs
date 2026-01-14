using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement;
using OnlineClassroomManagement.Helper.AppExtensions;
using OnlineClassroomManagement.Helper.Authorization;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Helper.Mapping;
using OnlineClassroomManagement.Helper.MappingProfile;
using OnlineClassroomManagement.Helper.Options;
using OnlineClassroomManagement.Models;
using OnlineClassroomManagement.Services.Background;
using OnlineClassroomManagement.Seed;
using Supabase;
using TanvirArjel.EFCore.GenericRepository;
var builder = WebApplication.CreateBuilder(args);

//// Thêm dòng này nếu dùng ngrok
//builder.Services.Configure<ForwardedHeadersOptions>(options =>
//{
//    options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.All;
//});

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
// Add services to the container.
builder.Host.SerilogConfiguration();
builder.Services.AddHostedService<AssignmentDeadlineProcessorService>();

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.Configure<PasswordResetOptions>(builder.Configuration.GetSection("PasswordReset"));

// Config JWT
builder.Services.ConfigureJWT(builder.Configuration);

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.RequireAdmin,
        policy => policy.RequireRole(Role.Admin.ToString()));

    options.AddPolicy(AuthorizationPolicies.RequireClassMember,
        policy => policy.AddRequirements(new ClassMemberRequirement()));
});
builder.Services.AddScoped<IAuthorizationHandler, ClassMemberAuthorizationHandler>();

builder.Services.AddCors(o => o.AddPolicy("PTIT_OCM_POLICY", builder =>
{
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
}));

// Configure DbContext with PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                    //options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Local;
                    //options.SerializerSettings.DateFormatString = "yyyy'-'MM'-'dd'T'HH':'mm':'sszzz";
                    //option.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                }
                )
                .ConfigureApiBehaviorOptions(options =>
                {
                    options.SuppressModelStateInvalidFilter = true;
                })
                ;

// Auto Mapper Configurations
var mapperConfig = new MapperConfiguration(mc =>
{
    mc.AddProfile(new MappingProfile());
    mc.AddProfile(new PostMappingProfile());
    mc.AddProfile(new CommentMappingProfile());
    mc.AddProfile(new DocumentMappingProfile());
    mc.AddProfile(new QuizMappingProfile());
    mc.AddProfile(new AssignmentMappingProfile());
    mc.AddProfile(new SubmissionMappingProfile());
});
IMapper mapper = mapperConfig.CreateMapper();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.ConfigureSwagger();

// Add Generic Repository, for usage -> see https://github.com/TanvirArjel/EFCore.GenericRepository/wiki
builder.Services.AddGenericRepository<AppDbContext>();

// Add Supabase client
string supabaseUrl = builder.Configuration.GetSection("Supabase").GetValue<string>("Url")!;
string supabaseKey = builder.Configuration.GetSection("Supabase").GetValue<string>("Key")!;
SupabaseOptions supabaseOptions = new SupabaseOptions()
{
    AutoConnectRealtime = true,
};

builder.Services.AddSingleton(new Client(supabaseUrl, supabaseKey, supabaseOptions));

// Service DI configuration
builder.Services.AddConfigServices();
builder.Services.AddTransient<DataSeeder>();



var app = builder.Build();

// Seed demo và thoát nếu có tham số --seed-demo
if (args.Contains("--seed-demo", StringComparer.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await seeder.SeedAsync();
    return;
}

// ⚙️ Cấu hình port động để chạy trên Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "5171"; // fallback cho local
app.Urls.Add($"http://*:{port}");

app.UseCors("PTIT_OCM_POLICY");

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI();
// }

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.Run();
