using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.ShopItems;
using OnlineClassroomManagement.Services;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize]
    public class ShopItemController : ApiControllerBase
    {
        private readonly IShopItemService _shopItemService;

        public ShopItemController(IShopItemService shopItemService)
        {
            _shopItemService = shopItemService;
        }

        // GET api/ShopItem/All
        [HttpGet("All")]
        public async Task<List<ShopItem>> GetAllShopItems()
        {
            return await _shopItemService.GetAllShopItems();
        }

        // GET api/ShopItem/List
        [HttpGet("List")]
        public async Task<PaginatedList<ShopItem>> GetListShopItems([FromQuery] GetPaginatedShopItemsRequest request)
        {
            return await _shopItemService.GetListShopItems(request);
        }

        // GET api/ShopItem/{id}
        [HttpGet("{id}")]
        public async Task<ShopItem> GetShopItemById(int id)
        {
            return await _shopItemService.GetShopItemById(id);
        }

        // POST api/ShopItem
        [HttpPost]
        public async Task<ShopItem> CreateShopItem([FromBody] ShopItem shopItem)
        {
            return await _shopItemService.CreateShopItem(shopItem);
        }

        // PUT api/ShopItem/{id}
        [HttpPut("{id}")]
        public async Task<ShopItem> UpdateShopItem(int id, [FromBody] ShopItem shopItem)
        {
            return await _shopItemService.UpdateShopItem(id, shopItem);
        }

        // DELETE api/ShopItem/{id}
        [HttpDelete("{id}")]
        public async Task DeleteShopItem(int id)
        {
            await _shopItemService.DeleteShopItem(id);
        }

        // POST api/ShopItem/UploadIcon
        [HttpPost("UploadIcon")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadShopItemIcon([FromForm] UploadShopItemIconRequest request)
        {
            string iconUrl = await _shopItemService.UploadShopItemIcon(request.File);
            return Ok(new { iconUrl });
        }
    }
}
