using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement.Models.Requests.Classes;
using OnlineClassroomManagement.Models.Responses.Classes;
using OnlineClassroomManagement.Services;
using TanvirArjel.EFCore.GenericRepository;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireClassMember)]
    public class ClassController : ApiControllerBase
    {
        private readonly IClassService _classService;

        public ClassController(IClassService classService)
        {
            _classService = classService;
        }

        // GET api/Class/All
        [HttpGet("All")]
        public async Task<List<ClassResponse>> GetAllClasses()
        {
            return await _classService.GetAllClasses();
        }

        // GET api/Class/List
        [HttpGet("List")]
        public async Task<PaginatedList<ClassResponse>> GetListClasses([FromQuery] GetPaginatedClassesRequest request)
        {
            return await _classService.GetListClasses(request);
        }

        // GET api/Class/{id}
        [HttpGet("{id}")]
        public async Task<ClassResponse> GetClassById(int id)
        {
            return await _classService.GetClassById(id);
        }

        // GET api/Class/My
        [HttpGet("My")]
        public async Task<List<ClassResponse>> GetMyClasses()
        {
            return await _classService.GetMyClasses();
        }

        // GET api/Class/{id}/Members
        [HttpGet("{id}/Members")]
        public async Task<List<ClassMemberResponse>> GetClassMembers(int id)
        {
            return await _classService.GetClassMembers(id);
        }

        // GET api/Class/{id}/AppearanceSettings
        [HttpGet("{id}/AppearanceSettings")]
        public async Task<ClassAppearanceSettingsResponse> GetClassAppearanceSettings(int id)
        {
            return await _classService.GetClassAppearanceSettings(id);
        }

        // POST api/Class
        [HttpPost]
        public async Task<ClassResponse> CreateClass([FromBody] CreateClassRequest request)
        {
            return await _classService.CreateClass(request);
        }

        // POST api/Class/Join
        [HttpPost("Join")]
        public async Task<ClassResponse> JoinClass([FromBody] JoinClassRequest request)
        {
            return await _classService.JoinClass(request);
        }

        // PUT api/Class/{id}
        [HttpPut("{id}")]
        public async Task UpdateClass(int id, [FromBody] UpdateClassRequest request)
        {
            await _classService.UpdateClass(id, request);
        }

        // PUT api/Class/{id}/AppearanceSettings
        [HttpPut("{id}/AppearanceSettings")]
        public async Task<ClassAppearanceSettingsResponse> UpdateClassAppearanceSettings(int id, [FromBody] UpdateClassAppearanceSettingsRequest request)
        {
            return await _classService.UpdateClassAppearanceSettings(id, request);
        }

        // POST api/Class/{id}/Cover
        [HttpPost("{id}/Cover")]
        [Consumes("multipart/form-data")]
        public async Task<UploadClassCoverResponse> UploadClassCover(int id, [FromForm] UploadClassCoverRequest request)
        {
            return await _classService.UploadClassCover(id, request.File);
        }

        // DELETE api/Class/{id}
        [HttpDelete("{id}")]
        public async Task DeleteClass(int id)
        {
            await _classService.DeleteClass(id);
        }

        // DELETE api/Class/{id}/Leave
        [HttpDelete("{id}/Leave")]
        public async Task LeaveClass(int id)
        {
            await _classService.LeaveClass(id);
        }

        // DELETE api/Class/{id}/Members/{memberId}
        [HttpDelete("{id}/Members/{memberId}")]
        public async Task RemoveMember(int id, int memberId)
        {
            await _classService.RemoveMember(id, memberId);
        }

        // PUT api/Class/{id}/Members/{memberId}
        [HttpPut("{id}/Members/{memberId}")]
        public async Task<ClassMemberResponse> UpdateMember(int id, int memberId, [FromBody] UpdateClassMemberRequest request)
        {
            return await _classService.UpdateClassMember(id, memberId, request);
        }

        // GET api/Class/{id}/ShopItems
        [HttpGet("{id}/ShopItems")]
        public async Task<List<ClassShopItemResponse>> GetClassShopItems(int id)
        {
            return await _classService.GetClassShopItems(id);
        }

        // GET api/Class/{id}/Cosmetics
        [HttpGet("{id}/Cosmetics")]
        public async Task<List<ClassMemberCosmeticResponse>> GetClassCosmetics(int id)
        {
            return await _classService.GetClassCosmetics(id);
        }

        // PUT api/Class/{id}/Cosmetics/Equip
        [HttpPut("{id}/Cosmetics/Equip")]
        public async Task<ClassMemberCosmeticResponse> EquipClassCosmetic(int id, [FromBody] EquipClassCosmeticRequest request)
        {
            return await _classService.EquipClassCosmetic(id, request);
        }

        // POST api/Class/{id}/ShopItems
        [HttpPost("{id}/ShopItems")]
        public async Task<List<ClassShopItemResponse>> AddShopItemsToClass(int id, [FromBody] AddClassShopItemsRequest request)
        {
            return await _classService.AddShopItemsToClass(id, request);
        }

        // DELETE api/Class/{id}/ShopItems/{classShopItemId}
        [HttpDelete("{id}/ShopItems/{classShopItemId}")]
        public async Task RemoveShopItemFromClass(int id, int classShopItemId)
        {
            await _classService.RemoveShopItemFromClass(id, classShopItemId);
        }

        // POST api/Class/{id}/ShopItems/{shopItemId}/Purchase
        [HttpPost("{id}/ShopItems/{shopItemId}/Purchase")]
        public async Task<PurchaseShopItemResponse> PurchaseShopItem(int id, int shopItemId)
        {
            return await _classService.PurchaseShopItem(id, shopItemId);
        }

        // POST api/Class/{id}/Invite
        [HttpPost("{id}/Invite")]
        public async Task InviteToClass(int id, [FromBody] InviteToClassRequest request)
        {
            await _classService.InviteToClass(id, request);
        }
    }
}