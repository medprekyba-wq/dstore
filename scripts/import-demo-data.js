import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const seedDataDir = path.join(process.cwd(), "seed-data");

// Helper: load and parse a JSON file
const loadJSON = (fileName) => {
  const filePath = path.join(seedDataDir, fileName);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data;
};

async function importDemoData() {
  try {
    console.log("🔄 Clearing existing data...");

    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.order.deleteMany(),
      prisma.coupon.deleteMany(),
      prisma.address.deleteMany(),
      prisma.productVariant.deleteMany(),
      prisma.additionalInformation.deleteMany(),
      prisma.attributeValue.deleteMany(),
      prisma.customAttribute.deleteMany(),
      prisma.heroBanner.deleteMany(),
      prisma.heroSlider.deleteMany(),
      prisma.countdown.deleteMany(),
      prisma.post.deleteMany(), // delete posts first to avoid FK issues
      prisma.postAuthor.deleteMany(),
      prisma.postCategory.deleteMany(),
      prisma.product.deleteMany(),
      prisma.category.deleteMany(),
      prisma.privacyPolicy.deleteMany(),
      prisma.termsConditions.deleteMany(),
      prisma.seoSetting.deleteMany(),
      prisma.headerSetting.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log("✅ Data cleared.");

    // Step-by-step critical relations first
    console.log("📥 Importing PostAuthor...");
    const postAuthors = loadJSON("PostAuthor.json");
    await prisma.postAuthor.createMany({ data: postAuthors });

    console.log("📥 Importing PostCategory...");
    const postCategories = loadJSON("PostCategory.json");
    await prisma.postCategory.createMany({ data: postCategories });

    console.log("📥 Importing Post...");
    const posts = loadJSON("Post.json");
    await prisma.post.createMany({ data: posts });

    // Now import other models in preferred order (without breaking constraints)
    const remainingFiles = [
      "Category.json",
      "Product.json",
      "User.json",
      "Address.json",
      "Order.json",
      "Review.json",
      "Coupon.json",
      "Countdown.json",
    ];

    for (const fileName of remainingFiles) {
      const filePath = path.join(seedDataDir, fileName);
      if (!fs.existsSync(filePath)) continue;

      const data = loadJSON(fileName);
      if (!data || data.length === 0) continue;

      const modelName = fileName.replace(".json", "").toLowerCase();
      const prismaModel = (prisma)[modelName];
      console.log(modelName, 'modelName')
      if (prismaModel) {
        console.log(`📥 Importing ${modelName}...`);

        // Format date fields
        data.forEach((item) => {
          if (item.countdownDate) item.countdownDate = new Date(item.countdownDate).toISOString();
          if (item.createdAt) item.createdAt = new Date(item.createdAt).toISOString();
          if (item.updatedAt) item.updatedAt = new Date(item.updatedAt).toISOString();
          if (item.emailVerified) item.emailVerified = new Date(item.emailVerified).toISOString();
          if (item.passwordResetTokenExp) item.passwordResetTokenExp = new Date(item.passwordResetTokenExp).toISOString();
          if (item.expires) item.expires = new Date(item.expires).toISOString();
        });

        await prismaModel.createMany({ data });
      } else {
        console.warn(`⚠️  No Prisma model found for: ${modelName}`);
      }
    }

    // product variant
    console.log("📥 Importing product variant...");
    const productVariants = loadJSON("ProductVariant.json");
    await prisma.productVariant.createMany({ data: productVariants });
    // additionalInformation
    console.log("📥 Importing additionalInformation...");
    const additionalInformation = loadJSON("AdditionalInformation.json");
    await prisma.additionalInformation.createMany({ data: additionalInformation });

    // customAttribute
    console.log("📥 Importing customAttribute...");
    const customAttribute = loadJSON("CustomAttribute.json");
    await prisma.customAttribute.createMany({ data: customAttribute });
    // attributeValue
    console.log("📥 Importing attributeValue...");
    const attributeValue = loadJSON("AttributeValue.json");
    await prisma.attributeValue.createMany({ data: attributeValue });
    // heroBanner
    console.log("📥 Importing heroBanner...");
    const heroBanners = loadJSON("HeroBanner.json");
    await prisma.heroBanner.createMany({ data: heroBanners });
    // heroSlider
    console.log("📥 Importing heroSlider...");
    const heroSliders = loadJSON("HeroSlider.json");
    await prisma.heroSlider.createMany({ data: heroSliders });

    // privacyPolicy
    const privacyPolicy = loadJSON("PrivacyPolicy.json");
    await prisma.privacyPolicy.createMany({ data: privacyPolicy });

    // termsConditions
    const termsConditions = loadJSON("TermsConditions.json");
    await prisma.termsConditions.createMany({ data: termsConditions });

    // seoSetting
    const seoSetting = loadJSON("SeoSetting.json");
    await prisma.seoSetting.createMany({ data: seoSetting });

    // headerSetting
    const headerSetting = loadJSON("HeaderSetting.json");
    await prisma.headerSetting.createMany({ data: headerSetting });

    console.log("✅ Seed data imported successfully!");
  } catch (error) {
    console.error("❌ Error importing seed data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importDemoData();
