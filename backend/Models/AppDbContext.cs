using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using OnlineClassroomManagement.Models.Entities;

namespace OnlineClassroomManagement.Models
{
    public class AppDbContext : DbContext
    {
        // Khai báo DbSet (Dùng để map từ entity -> table ở CSDL) ở đây
        // Cấu trúc : public DbSet<TênEntity> TênTable { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ClassMember> ClassMembers { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<AssignmentInClass> AssignmentInClass { get; set; }
        public DbSet<Submission> Submissions { get; set; }
        public DbSet<Grade> Grades { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
        public DbSet<QuizOption> QuizOptions { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostInClass> PostInClass { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Participant> Participants { get; set; }
        //public DbSet<ParticipantLog> ParticipantLogs { get; set; }
        public DbSet<LiveRoom> LiveRooms { get; set; }
        public DbSet<Message> Messages { get; set; }
        //public DbSet<Polling> Pollings { get; set; }
        //public DbSet<PollingOption> PollingOptions { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentCollection> DocumentCollections { get; set; }
        public DbSet<RewardActivity> RewardActivities { get; set; }
        public DbSet<UserRewardRedemption> UserRewardRedemptions { get; set; }
        public DbSet<UserShopItemState> UserShopItemStates { get; set; }
        public DbSet<ShopItem> ShopItems { get; set; }
        public DbSet<ClassMemberCosmetic> ClassMemberCosmetics { get; set; }
        public DbSet<ClassAppearanceSettings> ClassAppearanceSettings { get; set; }
        public DbSet<QuizAnswer> QuizAnswers { get; set; }
        public DbSet<AssignmentGroup> AssignmentGroups { get; set; }
        public DbSet<AssignmentGroupTopic> AssignmentGroupTopics { get; set; }
        public DbSet<AssignmentGroupMember> AssignmentGroupMembers { get; set; }
        public DbSet<AssignmentGroupInvitation> AssignmentGroupInvitations { get; set; }
        public DbSet<AssignmentGroupApprovalRequest> AssignmentGroupApprovalRequests { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ClassMember - User : n-1
            modelBuilder.Entity<ClassMember>()
                .HasOne(cm => cm.User)
                .WithMany()
                .HasForeignKey("UserId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Class - ClassMember : 1-n
            modelBuilder.Entity<Class>()
                .HasMany(cm => cm.Members)
                .WithOne(member => member.Class)
                .HasForeignKey("ClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // ClassMember - ClassMemberCosmetic : 1-1
            modelBuilder.Entity<ClassMember>()
                .HasOne(member => member.Cosmetics)
                .WithOne(cosmetic => cosmetic.ClassMember)
                .HasForeignKey<ClassMemberCosmetic>(cosmetic => cosmetic.ClassMemberId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            modelBuilder.Entity<ClassMemberCosmetic>()
                .HasKey(cosmetic => cosmetic.ClassMemberId);

            // ClassMemberCosmetic - ShopItem : n-1 (AvatarFrame, ChatFrame, Badge) với DeleteBehavior.Restrict
            modelBuilder.Entity<ClassMemberCosmetic>()
                .HasOne(cosmetic => cosmetic.AvatarFrameShopItem)
                .WithMany()
                .HasForeignKey(cosmetic => cosmetic.AvatarFrameShopItemId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // ClassMemberCosmetic - ShopItem : n-1 (AvatarFrame, ChatFrame, Badge) với DeleteBehavior.Restrict
            modelBuilder.Entity<ClassMemberCosmetic>()
                .HasOne(cosmetic => cosmetic.ChatFrameShopItem)
                .WithMany()
                .HasForeignKey(cosmetic => cosmetic.ChatFrameShopItemId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // ClassMemberCosmetic - ShopItem : n-1 (AvatarFrame, ChatFrame, Badge) với DeleteBehavior.Restrict
            modelBuilder.Entity<ClassMemberCosmetic>()
                .HasOne(cosmetic => cosmetic.BadgeShopItem)
                .WithMany()
                .HasForeignKey(cosmetic => cosmetic.BadgeShopItemId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // User - Class : 1-n
            modelBuilder.Entity<Class>()
                .HasOne(c => c.CreatedByUser)
                .WithMany()
                .HasForeignKey("CreatedByUserId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Assignment - ClassMember : n-1
            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.CreatedBy)
                .WithMany()
                .HasForeignKey("CreatedByClassMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // AssignmentInClass - Assignment : n-1
            modelBuilder.Entity<AssignmentInClass>()
                .HasOne(ad => ad.Assignment)
                .WithMany()
                .HasForeignKey("AssignmentId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // AssignmentInClass - Class : n-1
            modelBuilder.Entity<AssignmentInClass>()
                .HasOne(ad => ad.Class)
                .WithMany()
                .HasForeignKey("ClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // AssignmentInClass - Submission : 1-n
            modelBuilder.Entity<AssignmentInClass>()
                .HasMany(ad => ad.Submissions)
                .WithOne()
                .HasForeignKey("AssignmentInClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Submission - ClassMember : n-1
            modelBuilder.Entity<Submission>()
                .HasOne(s => s.SubmitBy)
                .WithMany()
                .HasForeignKey("SubmittedByClassMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Submission - Grade : 1-1
            modelBuilder.Entity<Submission>()
                .HasOne(s => s.Grade)
                .WithOne()
                .HasForeignKey<Submission>("GradeId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // Grade - ClassMember : n-1
            modelBuilder.Entity<Grade>()
                .HasOne(g => g.GradedBy)
                .WithMany()
                .HasForeignKey("GradedByClassMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // QuizQuestion - QuizOption: 1 - n
            modelBuilder.Entity<QuizQuestion>()
                .HasMany(e => e.Options)
                .WithOne()
                .HasForeignKey("QuizQuestionId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Assignment - QuizQuestion
            modelBuilder.Entity<Assignment>()
                .HasMany(a => a.ListQuestions)
                .WithOne()
                .HasForeignKey("AssignmentId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // PostInClass - Post: n - 1
            modelBuilder.Entity<PostInClass>()
                .HasOne(e => e.Post)
                .WithMany()
                .HasForeignKey("PostId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // PostInClass - Class: n - 1
            modelBuilder.Entity<PostInClass>()
                .HasOne(e => e.Class)
                .WithMany()
                .HasForeignKey("ClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Post - ClassMember: n - 1
            modelBuilder.Entity<Post>()
                .HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey("CreatedByClassMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Post - Comment: 1 - n
            modelBuilder.Entity<Post>()
                .HasMany(e => e.Comments)
                .WithOne()
                .HasForeignKey("PostId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Comment - ClassMember: n - 1
            modelBuilder.Entity<Comment>()
                .HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey("CreatedByClassMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Comment - Comment (Self-referencing): 1 - n
            modelBuilder.Entity<Comment>()
                .HasOne(e => e.ParentComment)
                .WithMany(parent => parent.Replies)
                .HasForeignKey("ParentCommentId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // ClassMember - Participant: 1 - n
            modelBuilder.Entity<Participant>()
                .HasOne(e => e.ClassMember)
                .WithMany()
                .HasForeignKey("ClassMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Participant - LiveRoom: n - 1
            modelBuilder.Entity<Participant>()
                .HasOne(e => e.LiveRoom)
                .WithMany()
                .HasForeignKey("LiveRoomId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);


            // Message - LiveRoom: n - 1
            modelBuilder.Entity<Message>()
                .HasOne(e => e.LiveRoom)
                .WithMany()
                .HasForeignKey("LiveRoomId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // LiveRoom - ClassMember: n - 1
            modelBuilder.Entity<LiveRoom>()
                .HasOne(e => e.CreatedBy)
                .WithMany()
                .HasForeignKey("CreatedByClassMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Message - Participant: n - 1
            modelBuilder.Entity<Message>()
                .HasOne(e => e.SentBy)
                .WithMany()
                .HasForeignKey("SentByParticipantId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            //// Message - Polling: 1 - 0..1
            //modelBuilder.Entity<Message>()
            //    .HasOne(e => e.Polling)
            //    .WithOne()
            //    .HasForeignKey<Message>("PollingId")
            //    .OnDelete(DeleteBehavior.Cascade)
            //    .IsRequired(false);

            //// Polling - PollingOption: 1 - n   
            //modelBuilder.Entity<Polling>()
            //    .HasMany(e => e.Options)
            //    .WithOne()
            //    .HasForeignKey("PollingId")
            //    .OnDelete(DeleteBehavior.Cascade)
            //    .IsRequired(true);

            //// PollingOption - ClassMember: n - n
            //modelBuilder.Entity<PollingOption>()
            //    .HasMany(e => e.VotedMember)
            //    .WithMany()
            //    .UsingEntity(j => j.ToTable("PollingOptionVotes"));

            // Comment - Document: 1 - 0..1
            modelBuilder.Entity<Comment>()
                .HasOne(e => e.Document)
                .WithOne()
                .HasForeignKey<Comment>("DocumentId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // Document - ClassMember: n - 1
            modelBuilder.Entity<Document>()
                .HasOne(e => e.UploadedBy)
                .WithMany()
                .HasForeignKey("UploadedByClassMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Submission - Document: 1 - n
            modelBuilder.Entity<Submission>()
                .HasMany(e => e.SubmittedFiles)
                .WithOne()
                .HasForeignKey("SubmissionId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // Assignment - Document: 1 - n
            modelBuilder.Entity<Assignment>()
                .HasMany(e => e.Attachments)
                .WithOne()
                .HasForeignKey("AssignmentId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // Class - Document: 1 - n
            modelBuilder.Entity<Class>()
                .HasMany(e => e.Documents)
                .WithOne()
                .HasForeignKey("ClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Post - Document: 1 - n
            modelBuilder.Entity<Post>()
                .HasMany(e => e.Documents)
                .WithOne()
                .HasForeignKey("PostId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // DocumentCollection - User: n - 1
            modelBuilder.Entity<DocumentCollection>()
                .HasOne(dc => dc.Owner)
                .WithMany()
                .HasForeignKey("OwnerId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // RewardActivity - User: n - 1
            modelBuilder.Entity<RewardActivity>()
                .HasOne(ra => ra.User)
                .WithMany()
                .HasForeignKey("UserId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // RewardActivity - Class: n - 1
            modelBuilder.Entity<RewardActivity>()
                .HasOne(ra => ra.Class)
                .WithMany()
                .HasForeignKey("ClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // RewardActivity - ClassMember (GrantedBy): n - 1
            modelBuilder.Entity<RewardActivity>()
                .HasOne(ra => ra.GrantedBy)
                .WithMany()
                .HasForeignKey("GrantedByClassMemberId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // UserRewardRedemption - User: n - 1
            modelBuilder.Entity<UserRewardRedemption>()
                .HasOne(urr => urr.User)
                .WithMany()
                .HasForeignKey("UserId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // UserRewardRedemption - Class: n - 1
            modelBuilder.Entity<UserRewardRedemption>()
                .HasOne(urr => urr.Class)
                .WithMany()
                .HasForeignKey("ClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // DocumentCollection - DocumentCollectionItem: 1 - n
            modelBuilder.Entity<DocumentCollection>()
                .HasMany(dc => dc.Documents)
                .WithOne()
                .HasForeignKey("DocumentCollectionId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // Tạo discriminator cho DocumentCollectionItem kế thừa từ Document
            modelBuilder.Entity<Document>()
                .HasDiscriminator<string>("DocumentType")
                .HasValue<Document>("Document")
                .HasValue<DocumentCollectionItem>("DocumentCollectionItem");

            // ShopItemInClass - Class: n - 1
            modelBuilder.Entity<Class>()
                .HasMany(c => c.ShopItemInClasses)
                .WithOne()
                .HasForeignKey("ClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // ShopItemInClass - ShopItem: n - 1
            modelBuilder.Entity<ShopItemInClass>()
                .HasOne(sic => sic.ShopItem)
                .WithMany()
                .HasForeignKey("ShopItemId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // ClassAppearanceSettings - Class: 1 - 1
            modelBuilder.Entity<ClassAppearanceSettings>()
                .HasKey(settings => settings.ClassId);

            modelBuilder.Entity<Class>()
                .HasOne(c => c.AppearanceSettings)
                .WithOne(settings => settings.Class)
                .HasForeignKey<ClassAppearanceSettings>(settings => settings.ClassId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // UserShopItemState - User: n - 1
            modelBuilder.Entity<UserShopItemState>()
                .HasOne(state => state.User)
                .WithMany()
                .HasForeignKey("UserId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // UserShopItemState - Class: n - 1
            modelBuilder.Entity<UserShopItemState>()
                .HasOne(state => state.Class)
                .WithMany()
                .HasForeignKey("ClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // UserShopItemState - ShopItem: n - 1
            modelBuilder.Entity<UserShopItemState>()
                .HasOne(state => state.ShopItem)
                .WithMany()
                .HasForeignKey("ShopItemId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            modelBuilder.Entity<UserShopItemState>()
                .HasIndex("UserId", "ClassId", "ShopItemId")
                .IsUnique();

            // Submission - QuizAnswer: 1 - n
            modelBuilder.Entity<Submission>()
                .HasMany(s => s.Answers)
                .WithOne()
                .HasForeignKey("SubmissionId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // QuizQuestion - QuizAnswer: 1 - n
            modelBuilder.Entity<QuizQuestion>()
                .HasMany(q => q.Answers)
                .WithOne()
                .HasForeignKey("QuizQuestionId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // Class - LiveRoom: 1-n
            modelBuilder.Entity<LiveRoom>()
                .HasOne(r => r.Class)
                .WithMany()
                .HasForeignKey("ClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // RoomNotifcation - LiveRoom: n - 1

            // AssignmentInClass - AssignmentGroup: 1 - n
            modelBuilder.Entity<AssignmentInClass>()
                .HasMany(a => a.AssignmentGroups)
                .WithOne()
                .HasForeignKey("AssignmentInClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // AssignmentInClass - AssignmentGroupTopic: 1 - n
            modelBuilder.Entity<AssignmentInClass>()
                .HasMany(a => a.AssignmentGroupTopics)
                .WithOne()
                .HasForeignKey("AssignmentInClassId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // AssignmentGroup - AssignmentGroupMember: 1 - n
            modelBuilder.Entity<AssignmentGroup>()
                .HasMany(ag => ag.GroupMembers)
                .WithOne()
                .HasForeignKey("AssignmentGroupId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // AssignmentGroup - AssignmentGroupInvitation: 1 - n
            modelBuilder.Entity<AssignmentGroup>()
                .HasMany(ag => ag.GroupInvitations)
                .WithOne()
                .HasForeignKey("AssignmentGroupId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // AssignmentGroupTopic - AssignmentGroup: 1 - n
            modelBuilder.Entity<AssignmentGroupTopic>()
                .HasMany(agt => agt.AssignmentGroups)
                .WithOne()
                .HasForeignKey("AssignmentGroupTopicId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // AssignmentGroup - AssignmentGroupApprovalRequest: 1 - n
            modelBuilder.Entity<AssignmentGroup>()
                .HasMany(ag => ag.ApprovalRequests)
                .WithOne()
                .HasForeignKey("AssignmentGroupId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // AssignmentGroupTopic - AssignmentGroupApprovalRequest: 1 - n
            modelBuilder.Entity<AssignmentGroupTopic>()
                .HasMany(agt => agt.ApprovalRequests)
                .WithOne()
                .HasForeignKey("AssignmentGroupTopicId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // AssignmentGroupMember - ClassMember: n - 1
            modelBuilder.Entity<AssignmentGroupMember>()
                .HasOne(gm => gm.Member)
                .WithMany()
                .HasForeignKey("MemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // GroupInvitation - ToMember (ClassMember): n - 1
            modelBuilder.Entity<AssignmentGroupInvitation>()
                .HasOne(gi => gi.ToMember)
                .WithMany()
                .HasForeignKey("ToMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);

            // // GroupInvitation - FromMember (ClassMember): n - 1
            modelBuilder.Entity<AssignmentGroupInvitation>()
                .HasOne(gi => gi.FromMember)
                .WithMany()
                .HasForeignKey("FromMemberId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(true);


            // Submission - AssignmentGroup: 1 - 0..1
            modelBuilder.Entity<Submission>()
                .HasOne(s => s.AssignmentGroup)
                .WithOne()
                .HasForeignKey<Submission>("AssignmentGroupId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);


            // Notification - Sender: n - 0..1
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Sender)
                .WithMany()
                .HasForeignKey("SenderId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // Notification - Receiver: n - 1
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Receiver)
                .WithMany()
                .HasForeignKey("ReceiverId")
                .OnDelete(DeleteBehavior.Cascade);
        }

        public override int SaveChanges()
        {
            //OnBeforeSaving();
            return base.SaveChanges();
        }

        //private void OnBeforeSaving()
        //{
        //    IEnumerable<EntityEntry> entries = ChangeTracker.Entries();
        //    DateTime utcNow = DateTime.UtcNow;

        //    foreach (EntityEntry entry in entries)
        //    {
        //        switch (entry.State)
        //        {
        //            case EntityState.Modified:
        //                // Set UpdatedDate to current date/time for updated entities
        //                entry.Property("UpdatedDate").CurrentValue = utcNow;
        //                break;
        //            case EntityState.Added:
        //                // Set CreatedDate and UpdatedDate to current date/time for new entities
        //                entry.Property("CreatedDate").CurrentValue = utcNow;
        //                entry.Property("UpdatedDate").CurrentValue = utcNow;
        //                break;
        //            case EntityState.Detached:
        //                break;
        //            case EntityState.Unchanged:
        //                break;
        //            case EntityState.Deleted:
        //                break;
        //            default:
        //                throw new ArgumentOutOfRangeException();
        //        }
        //    }
        //}
    }



    // Dùng cho migration
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {

            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
