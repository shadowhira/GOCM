using AutoMapper;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Helper.Utilities;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Classes;
using OnlineClassroomManagement.Models.Responses.Classes;

namespace OnlineClassroomManagement.Helper.MappingProfile
{
    public class ClassMappingProfile : Profile
    {
        public ClassMappingProfile()
        {
            // Class mappings  
            CreateMap<Class, ClassResponse>()
                .ForMember(dest => dest.CreatedByUserAvatarUrl, opt => opt.MapFrom(src => src.CreatedByUser.AvatarUrl))
                .ForMember(dest => dest.AppearanceSettings, opt => opt.MapFrom(src => src.AppearanceSettings));

            CreateMap<CreateClassRequest, Class>();

            CreateMap<UpdateClassRequest, Class>();

            // ClassMember mappings
            CreateMap<ClassMember, ClassMemberResponse>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.User.Id))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.DisplayName))
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.User.AvatarUrl))
                .ForMember(dest => dest.RoleInClass, opt => opt.MapFrom(src => src.RoleInClass.GetText()))
                .ForMember(dest => dest.RoleInClassValue, opt => opt.MapFrom(src => src.RoleInClass))
                .ForMember(dest => dest.Points, opt => opt.MapFrom(src => src.Points))
                .ForMember(dest => dest.Cosmetics, opt => opt.MapFrom(src => MapCosmeticSlots(src)));

            CreateMap<ClassAppearanceSettings, ClassAppearanceSettingsResponse>();
        }

        private static ClassMemberCosmeticSlotsResponse? MapCosmeticSlots(ClassMember member)
        {
            if (member.Cosmetics == null)
            {
                return null;
            }

            return new ClassMemberCosmeticSlotsResponse
            {
                AvatarFrame = MapShopItem(member.Cosmetics.AvatarFrameShopItem),
                ChatFrame = MapShopItem(member.Cosmetics.ChatFrameShopItem),
                Badge = MapShopItem(member.Cosmetics.BadgeShopItem)
            };
        }

        private static EquippedCosmeticItemResponse? MapShopItem(ShopItem? shopItem)
        {
            if (shopItem == null)
            {
                return null;
            }

            return new EquippedCosmeticItemResponse
            {
                ShopItemId = shopItem.Id,
                Name = shopItem.Name,
                IconUrl = shopItem.IconUrl ?? string.Empty,
                VisualType = shopItem.VisualType,
                Tier = shopItem.Tier,
                Config = CosmeticConfigParser.Parse(shopItem.ConfigJson)
            };
        }
    }
}
