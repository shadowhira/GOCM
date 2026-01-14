using Livekit.Server.Sdk.Dotnet;
using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Services;

namespace OnlineClassroomManagement.Controllers
{
    // Controller để nhận webhook từ LiveKit
    [ApiController]
    [Route("api/[controller]")]
    public class WebhookController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<WebhookController> _logger;
        private IWebhookService _webhookService;

        public WebhookController(IConfiguration configuration, ILogger<WebhookController> logger, IWebhookService webhookService)
        {
            _configuration = configuration;
            _logger = logger;
            _webhookService = webhookService;
        }

        [HttpPost("")]
        public async Task<IActionResult> ReceiveWebhook()
        {
            try
            {
                _logger.LogInformation("===== Webhook received =====");

                var livekit = _configuration.GetSection("Livekit");
                var apiKey = livekit["Key"];
                var apiSecret = livekit["Secret"];

                if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
                {
                    _logger.LogError("LiveKit API Key hoặc Secret chưa được cấu hình");
                    return Ok(); // VẪN RETURN OK!
                }

                // Đọc Authorization header (LiveKit gửi JWT token ở đây)
                var authHeader = Request.Headers["Authorization"].FirstOrDefault();

                _logger.LogInformation($"Auth header present: {!string.IsNullOrEmpty(authHeader)}");

                // Đọc body
                Request.EnableBuffering(); // Cho phép đọc body nhiều lần
                using var reader = new StreamReader(Request.Body, leaveOpen: true);
                var postData = await reader.ReadToEndAsync();
                Request.Body.Position = 0;

                _logger.LogInformation($"Body length: {postData?.Length ?? 0}");

                if (string.IsNullOrEmpty(postData))
                {
                    _logger.LogWarning("Webhook body trống");
                    return Ok(); // VẪN RETURN OK!
                }

                // Verify và parse webhook
                var webhookReceiver = new WebhookReceiver(apiKey, apiSecret);

                // QUAN TRỌNG: Phải truyền cả body VÀ authHeader
                var webhookEvent = webhookReceiver.Receive(postData, authHeader);

                _logger.LogInformation($"Event: {webhookEvent.Event}");
                _logger.LogInformation($"Room: {webhookEvent.Room?.Name}");
                _logger.LogInformation($"Participant: {webhookEvent.Participant?.Identity}");

                // Xử lý event
                await _webhookService.WebhookEventHandler(webhookEvent);

                return Ok();
            }
            catch (Exception ex)
            {
                // Log lỗi CHI TIẾT để debug
                _logger.LogError(ex, $"Lỗi xử lý webhook: {ex.Message}");

                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }

                // QUAN TRỌNG: KHÔNG throw exception, luôn return OK
                // để LiveKit không retry liên tục
                return Ok();
            }
        }
    }
}