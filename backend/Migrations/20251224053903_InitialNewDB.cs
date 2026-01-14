using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OnlineClassroomManagement.Migrations
{
    /// <inheritdoc />
    public partial class InitialNewDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShopItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CostInPoints = table.Column<int>(type: "integer", nullable: false),
                    IconUrl = table.Column<string>(type: "text", nullable: false),
                    ConfigJson = table.Column<string>(type: "text", nullable: false),
                    UsageDurationDays = table.Column<int>(type: "integer", nullable: false),
                    VisualType = table.Column<int>(type: "integer", nullable: false),
                    Tier = table.Column<int>(type: "integer", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AvatarUrl = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Classes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    JoinCode = table.Column<string>(type: "text", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CoverImageUrl = table.Column<string>(type: "text", nullable: true),
                    CoverColor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Classes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Classes_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentCollections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    OwnerId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentCollections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentCollections_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Data = table.Column<string>(type: "text", nullable: false),
                    ReceiverId = table.Column<int>(type: "integer", nullable: false),
                    SenderId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LinkRedirect = table.Column<string>(type: "text", nullable: false),
                    OpenNewTab = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_ReceiverId",
                        column: x => x.ReceiverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClassAppearanceSettings",
                columns: table => new
                {
                    ClassId = table.Column<int>(type: "integer", nullable: false),
                    ShowAvatarFrames = table.Column<bool>(type: "boolean", nullable: false),
                    ShowChatFrames = table.Column<bool>(type: "boolean", nullable: false),
                    ShowBadges = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassAppearanceSettings", x => x.ClassId);
                    table.ForeignKey(
                        name: "FK_ClassAppearanceSettings_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClassMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false),
                    RoleInClass = table.Column<int>(type: "integer", nullable: false),
                    EnrollDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassMembers_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShopItemInClass",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ShopItemId = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopItemInClass", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShopItemInClass_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ShopItemInClass_ShopItems_ShopItemId",
                        column: x => x.ShopItemId,
                        principalTable: "ShopItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRewardRedemptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false),
                    ShopItemId = table.Column<int>(type: "integer", nullable: false),
                    RedeemedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRewardRedemptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRewardRedemptions_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRewardRedemptions_ShopItems_ShopItemId",
                        column: x => x.ShopItemId,
                        principalTable: "ShopItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRewardRedemptions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserShopItemStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false),
                    ShopItemId = table.Column<int>(type: "integer", nullable: false),
                    TotalPurchases = table.Column<int>(type: "integer", nullable: false),
                    LastRedeemedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserShopItemStates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserShopItemStates_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserShopItemStates_ShopItems_ShopItemId",
                        column: x => x.ShopItemId,
                        principalTable: "ShopItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserShopItemStates_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Assignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true),
                    Deadline = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    MaxScore = table.Column<double>(type: "double precision", nullable: false),
                    CreatedByClassMemberId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    AllowShowResultToStudent = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Assignments_ClassMembers_CreatedByClassMemberId",
                        column: x => x.CreatedByClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClassMemberCosmetics",
                columns: table => new
                {
                    ClassMemberId = table.Column<int>(type: "integer", nullable: false),
                    AvatarFrameShopItemId = table.Column<int>(type: "integer", nullable: true),
                    ChatFrameShopItemId = table.Column<int>(type: "integer", nullable: true),
                    BadgeShopItemId = table.Column<int>(type: "integer", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassMemberCosmetics", x => x.ClassMemberId);
                    table.ForeignKey(
                        name: "FK_ClassMemberCosmetics_ClassMembers_ClassMemberId",
                        column: x => x.ClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassMemberCosmetics_ShopItems_AvatarFrameShopItemId",
                        column: x => x.AvatarFrameShopItemId,
                        principalTable: "ShopItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassMemberCosmetics_ShopItems_BadgeShopItemId",
                        column: x => x.BadgeShopItemId,
                        principalTable: "ShopItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassMemberCosmetics_ShopItems_ChatFrameShopItemId",
                        column: x => x.ChatFrameShopItemId,
                        principalTable: "ShopItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Grades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Score = table.Column<double>(type: "double precision", nullable: false),
                    Feedback = table.Column<string>(type: "text", nullable: true),
                    GradedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    GradedByClassMemberId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Grades_ClassMembers_GradedByClassMemberId",
                        column: x => x.GradedByClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LiveRooms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    ScheduledStartAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ScheduledEndAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedByClassMemberId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiveRooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LiveRooms_ClassMembers_CreatedByClassMemberId",
                        column: x => x.CreatedByClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LiveRooms_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Posts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    CreatedByClassMemberId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Posts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Posts_ClassMembers_CreatedByClassMemberId",
                        column: x => x.CreatedByClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RewardActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    TotalEarnedPoints = table.Column<int>(type: "integer", nullable: false),
                    ParentType = table.Column<int>(type: "integer", nullable: true),
                    ParentId = table.Column<int>(type: "integer", nullable: true),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    GrantedByClassMemberId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RewardActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RewardActivities_ClassMembers_GrantedByClassMemberId",
                        column: x => x.GrantedByClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RewardActivities_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RewardActivities_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentInClass",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AssignmentId = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentInClass", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssignmentInClass_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentInClass_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuestionText = table.Column<string>(type: "text", nullable: false),
                    QuestionType = table.Column<int>(type: "integer", nullable: false),
                    Point = table.Column<double>(type: "double precision", nullable: false),
                    AssignmentId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizQuestions_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Participants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LivekitIdentity = table.Column<string>(type: "text", nullable: true),
                    IsRaisingHand = table.Column<bool>(type: "boolean", nullable: false),
                    LiveRoomId = table.Column<int>(type: "integer", nullable: false),
                    ClassMemberId = table.Column<int>(type: "integer", nullable: false),
                    JoinAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LeaveAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Participants_ClassMembers_ClassMemberId",
                        column: x => x.ClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Participants_LiveRooms_LiveRoomId",
                        column: x => x.LiveRoomId,
                        principalTable: "LiveRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PostInClass",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PostId = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostInClass", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PostInClass_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PostInClass_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentGroupTopics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    MaxGroupsPerTopic = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    MaxMembers = table.Column<int>(type: "integer", nullable: false),
                    MinMembers = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AssignmentInClassId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentGroupTopics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssignmentGroupTopics_AssignmentInClass_AssignmentInClassId",
                        column: x => x.AssignmentInClassId,
                        principalTable: "AssignmentInClass",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OptionText = table.Column<string>(type: "text", nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false),
                    QuizQuestionId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizOptions_QuizQuestions_QuizQuestionId",
                        column: x => x.QuizQuestionId,
                        principalTable: "QuizQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SentByParticipantId = table.Column<int>(type: "integer", nullable: false),
                    LiveRoomId = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_LiveRooms_LiveRoomId",
                        column: x => x.LiveRoomId,
                        principalTable: "LiveRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Messages_Participants_SentByParticipantId",
                        column: x => x.SentByParticipantId,
                        principalTable: "Participants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AssignmentGroupTopicId = table.Column<int>(type: "integer", nullable: true),
                    AssignmentInClassId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssignmentGroups_AssignmentGroupTopics_AssignmentGroupTopic~",
                        column: x => x.AssignmentGroupTopicId,
                        principalTable: "AssignmentGroupTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentGroups_AssignmentInClass_AssignmentInClassId",
                        column: x => x.AssignmentInClassId,
                        principalTable: "AssignmentInClass",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentGroupApprovalRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RejectReason = table.Column<string>(type: "text", nullable: true),
                    RequestedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AssignmentGroupId = table.Column<int>(type: "integer", nullable: false),
                    AssignmentGroupTopicId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentGroupApprovalRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssignmentGroupApprovalRequests_AssignmentGroupTopics_Assig~",
                        column: x => x.AssignmentGroupTopicId,
                        principalTable: "AssignmentGroupTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentGroupApprovalRequests_AssignmentGroups_Assignment~",
                        column: x => x.AssignmentGroupId,
                        principalTable: "AssignmentGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentGroupInvitations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FromMemberId = table.Column<int>(type: "integer", nullable: false),
                    ToMemberId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    AssignmentGroupId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentGroupInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssignmentGroupInvitations_AssignmentGroups_AssignmentGroup~",
                        column: x => x.AssignmentGroupId,
                        principalTable: "AssignmentGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentGroupInvitations_ClassMembers_FromMemberId",
                        column: x => x.FromMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentGroupInvitations_ClassMembers_ToMemberId",
                        column: x => x.ToMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentGroupMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MemberId = table.Column<int>(type: "integer", nullable: false),
                    IsLeader = table.Column<bool>(type: "boolean", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AssignmentGroupId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentGroupMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssignmentGroupMembers_AssignmentGroups_AssignmentGroupId",
                        column: x => x.AssignmentGroupId,
                        principalTable: "AssignmentGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentGroupMembers_ClassMembers_MemberId",
                        column: x => x.MemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Submissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubmittedByClassMemberId = table.Column<int>(type: "integer", nullable: false),
                    SubmittedTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    GradeId = table.Column<int>(type: "integer", nullable: true),
                    AssignmentGroupId = table.Column<int>(type: "integer", nullable: true),
                    AssignmentInClassId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Submissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Submissions_AssignmentGroups_AssignmentGroupId",
                        column: x => x.AssignmentGroupId,
                        principalTable: "AssignmentGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Submissions_AssignmentInClass_AssignmentInClassId",
                        column: x => x.AssignmentInClassId,
                        principalTable: "AssignmentInClass",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Submissions_ClassMembers_SubmittedByClassMemberId",
                        column: x => x.SubmittedByClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Submissions_Grades_GradeId",
                        column: x => x.GradeId,
                        principalTable: "Grades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Documents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PublicUrl = table.Column<string>(type: "text", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    FileType = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false),
                    UploadedByClassMemberId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ParentType = table.Column<int>(type: "integer", nullable: false),
                    AssignmentId = table.Column<int>(type: "integer", nullable: true),
                    DocumentType = table.Column<string>(type: "character varying(34)", maxLength: 34, nullable: false),
                    PostId = table.Column<int>(type: "integer", nullable: true),
                    SubmissionId = table.Column<int>(type: "integer", nullable: true),
                    ManualDocumentUrl = table.Column<string>(type: "text", nullable: true),
                    ManualFileName = table.Column<string>(type: "text", nullable: true),
                    AddedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    SourceType = table.Column<int>(type: "integer", nullable: true),
                    DocumentCollectionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Documents_Assignments_AssignmentId",
                        column: x => x.AssignmentId,
                        principalTable: "Assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Documents_ClassMembers_UploadedByClassMemberId",
                        column: x => x.UploadedByClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Documents_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Documents_DocumentCollections_DocumentCollectionId",
                        column: x => x.DocumentCollectionId,
                        principalTable: "DocumentCollections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Documents_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Documents_Submissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "Submissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuizQuestionId = table.Column<int>(type: "integer", nullable: false),
                    SelectedOptionIds = table.Column<List<int>>(type: "integer[]", nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false),
                    TimeSpent = table.Column<int>(type: "integer", nullable: false),
                    AnsweredAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    SubmissionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAnswers_QuizQuestions_QuizQuestionId",
                        column: x => x.QuizQuestionId,
                        principalTable: "QuizQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizAnswers_Submissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "Submissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedByClassMemberId = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ParentCommentId = table.Column<int>(type: "integer", nullable: true),
                    DocumentId = table.Column<int>(type: "integer", nullable: true),
                    PostId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comments_ClassMembers_CreatedByClassMemberId",
                        column: x => x.CreatedByClassMemberId,
                        principalTable: "ClassMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comments_Comments_ParentCommentId",
                        column: x => x.ParentCommentId,
                        principalTable: "Comments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comments_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comments_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroupApprovalRequests_AssignmentGroupId",
                table: "AssignmentGroupApprovalRequests",
                column: "AssignmentGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroupApprovalRequests_AssignmentGroupTopicId",
                table: "AssignmentGroupApprovalRequests",
                column: "AssignmentGroupTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroupInvitations_AssignmentGroupId",
                table: "AssignmentGroupInvitations",
                column: "AssignmentGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroupInvitations_FromMemberId",
                table: "AssignmentGroupInvitations",
                column: "FromMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroupInvitations_ToMemberId",
                table: "AssignmentGroupInvitations",
                column: "ToMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroupMembers_AssignmentGroupId",
                table: "AssignmentGroupMembers",
                column: "AssignmentGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroupMembers_MemberId",
                table: "AssignmentGroupMembers",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroups_AssignmentGroupTopicId",
                table: "AssignmentGroups",
                column: "AssignmentGroupTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroups_AssignmentInClassId",
                table: "AssignmentGroups",
                column: "AssignmentInClassId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentGroupTopics_AssignmentInClassId",
                table: "AssignmentGroupTopics",
                column: "AssignmentInClassId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentInClass_AssignmentId",
                table: "AssignmentInClass",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentInClass_ClassId",
                table: "AssignmentInClass",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_CreatedByClassMemberId",
                table: "Assignments",
                column: "CreatedByClassMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_CreatedByUserId",
                table: "Classes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassMemberCosmetics_AvatarFrameShopItemId",
                table: "ClassMemberCosmetics",
                column: "AvatarFrameShopItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassMemberCosmetics_BadgeShopItemId",
                table: "ClassMemberCosmetics",
                column: "BadgeShopItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassMemberCosmetics_ChatFrameShopItemId",
                table: "ClassMemberCosmetics",
                column: "ChatFrameShopItemId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassMembers_ClassId",
                table: "ClassMembers",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassMembers_UserId",
                table: "ClassMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_CreatedByClassMemberId",
                table: "Comments",
                column: "CreatedByClassMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_DocumentId",
                table: "Comments",
                column: "DocumentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ParentCommentId",
                table: "Comments",
                column: "ParentCommentId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_PostId",
                table: "Comments",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCollections_OwnerId",
                table: "DocumentCollections",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_AssignmentId",
                table: "Documents",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ClassId",
                table: "Documents",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_DocumentCollectionId",
                table: "Documents",
                column: "DocumentCollectionId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_PostId",
                table: "Documents",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_SubmissionId",
                table: "Documents",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UploadedByClassMemberId",
                table: "Documents",
                column: "UploadedByClassMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_GradedByClassMemberId",
                table: "Grades",
                column: "GradedByClassMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_LiveRooms_ClassId",
                table: "LiveRooms",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_LiveRooms_CreatedByClassMemberId",
                table: "LiveRooms",
                column: "CreatedByClassMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_LiveRoomId",
                table: "Messages",
                column: "LiveRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_SentByParticipantId",
                table: "Messages",
                column: "SentByParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ReceiverId",
                table: "Notifications",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_SenderId",
                table: "Notifications",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_ClassMemberId",
                table: "Participants",
                column: "ClassMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_LiveRoomId",
                table: "Participants",
                column: "LiveRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_PostInClass_ClassId",
                table: "PostInClass",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_PostInClass_PostId",
                table: "PostInClass",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_CreatedByClassMemberId",
                table: "Posts",
                column: "CreatedByClassMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAnswers_QuizQuestionId",
                table: "QuizAnswers",
                column: "QuizQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAnswers_SubmissionId",
                table: "QuizAnswers",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizOptions_QuizQuestionId",
                table: "QuizOptions",
                column: "QuizQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_AssignmentId",
                table: "QuizQuestions",
                column: "AssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_RewardActivities_ClassId",
                table: "RewardActivities",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_RewardActivities_GrantedByClassMemberId",
                table: "RewardActivities",
                column: "GrantedByClassMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_RewardActivities_UserId",
                table: "RewardActivities",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopItemInClass_ClassId",
                table: "ShopItemInClass",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopItemInClass_ShopItemId",
                table: "ShopItemInClass",
                column: "ShopItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_AssignmentGroupId",
                table: "Submissions",
                column: "AssignmentGroupId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_AssignmentInClassId",
                table: "Submissions",
                column: "AssignmentInClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_GradeId",
                table: "Submissions",
                column: "GradeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Submissions_SubmittedByClassMemberId",
                table: "Submissions",
                column: "SubmittedByClassMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRewardRedemptions_ClassId",
                table: "UserRewardRedemptions",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRewardRedemptions_ShopItemId",
                table: "UserRewardRedemptions",
                column: "ShopItemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRewardRedemptions_UserId",
                table: "UserRewardRedemptions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserShopItemStates_ClassId",
                table: "UserShopItemStates",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_UserShopItemStates_ShopItemId",
                table: "UserShopItemStates",
                column: "ShopItemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserShopItemStates_UserId_ClassId_ShopItemId",
                table: "UserShopItemStates",
                columns: new[] { "UserId", "ClassId", "ShopItemId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssignmentGroupApprovalRequests");

            migrationBuilder.DropTable(
                name: "AssignmentGroupInvitations");

            migrationBuilder.DropTable(
                name: "AssignmentGroupMembers");

            migrationBuilder.DropTable(
                name: "ClassAppearanceSettings");

            migrationBuilder.DropTable(
                name: "ClassMemberCosmetics");

            migrationBuilder.DropTable(
                name: "Comments");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "PostInClass");

            migrationBuilder.DropTable(
                name: "QuizAnswers");

            migrationBuilder.DropTable(
                name: "QuizOptions");

            migrationBuilder.DropTable(
                name: "RewardActivities");

            migrationBuilder.DropTable(
                name: "ShopItemInClass");

            migrationBuilder.DropTable(
                name: "UserRewardRedemptions");

            migrationBuilder.DropTable(
                name: "UserShopItemStates");

            migrationBuilder.DropTable(
                name: "Documents");

            migrationBuilder.DropTable(
                name: "Participants");

            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropTable(
                name: "ShopItems");

            migrationBuilder.DropTable(
                name: "DocumentCollections");

            migrationBuilder.DropTable(
                name: "Posts");

            migrationBuilder.DropTable(
                name: "Submissions");

            migrationBuilder.DropTable(
                name: "LiveRooms");

            migrationBuilder.DropTable(
                name: "AssignmentGroups");

            migrationBuilder.DropTable(
                name: "Grades");

            migrationBuilder.DropTable(
                name: "AssignmentGroupTopics");

            migrationBuilder.DropTable(
                name: "AssignmentInClass");

            migrationBuilder.DropTable(
                name: "Assignments");

            migrationBuilder.DropTable(
                name: "ClassMembers");

            migrationBuilder.DropTable(
                name: "Classes");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
