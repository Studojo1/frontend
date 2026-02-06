import { relations } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  // Last-login-method plugin
  lastLoginMethod: text("last_login_method"),
  // Two-factor plugin
  twoFactorEnabled: boolean("two_factor_enabled"),
  // Admin plugin
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  // Phone-number plugin
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: boolean("phone_number_verified").default(false).notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Admin plugin
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Two-factor plugin
export const twoFactor = pgTable("two_factor", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  secret: text("secret"),
  backupCodes: text("backup_codes"),
});

// Passkey plugin
export const passkey = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at"),
    aaguid: text("aaguid"),
  },
  (table) => [index("passkey_userId_idx").on(table.userId)],
);

// JWT plugin
export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Onboarding profile (user "in records" = has row here)
export const userProfile = pgTable(
  "user_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    college: text("college").notNull(),
    yearOfStudy: text("year_of_study").notNull(),
    course: text("course").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("user_profile_userId_idx").on(table.userId)],
);

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  twoFactors: many(twoFactor),
  passkeys: many(passkey),
  profile: one(userProfile),
  resumes: many(resumes),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, { fields: [userProfile.userId], references: [user.id] }),
}));

// Resumes table for storing user resumes
export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    resumeData: jsonb("resume_data").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("resumes_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(user, { fields: [resumes.userId], references: [user.id] }),
}));

// Career applications table
export const careerApplications = pgTable(
  "career_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phoneNumber: text("phone_number").notNull(),
    city: text("city").notNull(),
    institutionName: text("institution_name").notNull(),
    currentYear: text("current_year").notNull(), // '1st Year', '2nd Year', etc.
    course: text("course").notNull(),
    areasOfInterest: jsonb("areas_of_interest").notNull(), // Array of selected interests
    formData: jsonb("form_data"), // Store full form data as JSONB for flexibility
    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    paymentStatus: text("payment_status").default("pending").notNull(), // 'pending', 'completed', 'failed', 'refunded'
    amount: integer("amount").notNull(), // Amount in paise
    status: text("status").default("submitted").notNull(), // 'submitted', 'reviewed', 'contacted', 'rejected'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("career_applications_email_idx").on(table.email),
    index("career_applications_phone_idx").on(table.phoneNumber),
    index("career_applications_created_idx").on(table.createdAt),
    index("career_applications_payment_status_idx").on(table.paymentStatus),
  ],
);

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, { fields: [twoFactor.userId], references: [user.id] }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, { fields: [passkey.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Companies table
export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("companies_name_idx").on(table.name),
    index("companies_email_idx").on(table.email),
  ],
);

// Company users table for partner panel authentication
export const companyUsers = pgTable(
  "company_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role").default("viewer").notNull(), // 'admin', 'viewer'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("company_users_company_id_idx").on(table.companyId),
    index("company_users_email_idx").on(table.email),
  ],
);

// Internships table for storing internship listings
export const internships = pgTable(
  "internships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    companyName: text("company_name").notNull(), // Keep for backward compatibility
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "restrict" }),
    description: text("description").notNull(),
    requirements: text("requirements").notNull(),
    location: text("location").notNull(),
    duration: text("duration").notNull(),
    stipend: text("stipend").notNull(),
    applicationDeadline: timestamp("application_deadline"),
    status: text("status").default("draft").notNull(), // 'draft', 'published', 'closed'
    slug: text("slug").notNull().unique(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    viewCount: integer("view_count").default(0).notNull(),
    clickCount: integer("click_count").default(0).notNull(),
    applicationCount: integer("application_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("internships_slug_idx").on(table.slug),
    index("internships_status_created_idx").on(table.status, table.createdAt),
    index("internships_company_id_idx").on(table.companyId),
  ],
);

// Internship applications table
export const internshipApplications = pgTable(
  "internship_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    internshipId: uuid("internship_id")
      .notNull()
      .references(() => internships.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "restrict" }),
    resumeSnapshot: jsonb("resume_snapshot").notNull(), // Locked resume data
    status: text("status").default("pending").notNull(), // 'pending', 'shortlisted', 'rejected', 'forwarded', 'accepted', 'interview_scheduled', 'more_info_requested'
    adminNotes: text("admin_notes"),
    companyToken: text("company_token"), // Token for company access (if forwarded)
    forwardedAt: timestamp("forwarded_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("internship_applications_internship_status_idx").on(
      table.internshipId,
      table.status,
    ),
    index("internship_applications_user_idx").on(table.userId),
    unique().on(table.internshipId, table.userId), // One application per student per internship
  ],
);

// Company tokens table for managing company access
export const companyTokens = pgTable(
  "company_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    internshipId: uuid("internship_id")
      .notNull()
      .references(() => internships.id, { onDelete: "cascade" }),
    applicationIds: jsonb("application_ids").notNull(), // Array of application IDs
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    partnerUserId: uuid("partner_user_id").references(() => companyUsers.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at"),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("company_tokens_token_idx").on(table.token)],
);

// Relations
export const internshipsRelations = relations(internships, ({ one, many }) => ({
  creator: one(user, {
    fields: [internships.createdBy],
    references: [user.id],
  }),
  company: one(companies, {
    fields: [internships.companyId],
    references: [companies.id],
  }),
  applications: many(internshipApplications),
}));

export const internshipApplicationsRelations = relations(
  internshipApplications,
  ({ one }) => ({
    internship: one(internships, {
      fields: [internshipApplications.internshipId],
      references: [internships.id],
    }),
    user: one(user, {
      fields: [internshipApplications.userId],
      references: [user.id],
    }),
    resume: one(resumes, {
      fields: [internshipApplications.resumeId],
      references: [resumes.id],
    }),
  }),
);

export const companyTokensRelations = relations(companyTokens, ({ one }) => ({
  internship: one(internships, {
    fields: [companyTokens.internshipId],
    references: [internships.id],
  }),
  creator: one(user, {
    fields: [companyTokens.createdBy],
    references: [user.id],
  }),
  partnerUser: one(companyUsers, {
    fields: [companyTokens.partnerUserId],
    references: [companyUsers.id],
  }),
}));

// Relations for companies
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(companyUsers),
  internships: many(internships),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
}));
