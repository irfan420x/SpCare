import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const connection = await mysql.createConnection(url);
const demoImage = "/manus-storage/spcare-madhutila-feature_e192a1b9.jpg";
const alternateImage = "/manus-storage/spcare-tourism_ac7e1da7.jpg";

try {
  const categories = [
    ["hospital", "হাসপাতাল", "Hospital", "হাসপাতাল ও স্বাস্থ্যসেবা তথ্য", "stethoscope", "red", 1],
    ["emergency", "জরুরি সেবা", "Emergency", "জরুরি কল ও সহায়তা সেবা", "siren", "gold", 2],
    ["blood", "ব্লাড ব্যাংক", "Blood Bank", "রক্তদান, খুঁজুন জীবন বাঁচান", "activity", "red", 3],
    ["government", "সরকারি সেবা", "Government", "সরকারি অফিস ও সেবা সমূহ", "landmark", "green", 4],
    ["social", "সোশ্যাল", "Social", "পোস্ট, গ্রুপ ও কমিউনিটি", "users", "green", 5],
    ["tourism", "পর্যটন", "Tourism", "পর্যটন স্থান ও ভ্রমণ গাইড", "trees", "green", 6],
    ["ngo", "সেবা সংস্থা", "Service Organisations", "এনজিও ও সামাজিক সংগঠনসমূহ", "heart", "green", 7],
    ["hotel", "হোটেল ও রিসোর্ট", "Hotels & Resorts", "হোটেল ও থাকার ব্যবস্থা", "building", "green", 8],
  ];
  for (const row of categories) {
    await connection.execute(
      "INSERT INTO categories (slug, nameBn, nameEn, subtitleBn, iconKey, accent, sortOrder, isActive, isDemo) VALUES (?, ?, ?, ?, ?, ?, ?, true, true) ON DUPLICATE KEY UPDATE nameBn=VALUES(nameBn), nameEn=VALUES(nameEn), subtitleBn=VALUES(subtitleBn), iconKey=VALUES(iconKey), accent=VALUES(accent), sortOrder=VALUES(sortOrder), isActive=true, isDemo=true",
      row,
    );
  }

  await connection.execute(
    "INSERT INTO locations (districtBn, upazilaBn, slug, latitude, longitude) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE upazilaBn=VALUES(upazilaBn), latitude=VALUES(latitude), longitude=VALUES(longitude)",
    ["শেরপুর", "শেরপুর সদর", "sherpur-sadar", "25.0205", "90.0170"],
  );
  await connection.execute(
    "INSERT INTO locations (districtBn, upazilaBn, slug, latitude, longitude) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE upazilaBn=VALUES(upazilaBn), latitude=VALUES(latitude), longitude=VALUES(longitude)",
    ["শেরপুর", "নালিতাবাড়ী", "nalitabari", "25.0905", "90.1937"],
  );
  await connection.execute(
    "INSERT INTO locations (districtBn, upazilaBn, slug, latitude, longitude) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE upazilaBn=VALUES(upazilaBn), latitude=VALUES(latitude), longitude=VALUES(longitude)",
    ["শেরপুর", "ঝিনাইগাতী", "jhenaigati", "25.1854", "89.9893"],
  );

  const [categoryRows] = await connection.query("SELECT id, slug FROM categories WHERE isDemo=true");
  const [locationRows] = await connection.query("SELECT id, slug FROM locations WHERE slug IN ('sherpur-sadar', 'nalitabari', 'jhenaigati')");
  const categoryId = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id]));
  const locationId = Object.fromEntries(locationRows.map((row) => [row.slug, row.id]));

  const services = [
    ["sherpur-district-hospital", categoryId.hospital, locationId["sherpur-sadar"], "শেরপুর জেলা হাসপাতাল", "Sherpur District Hospital", "জেলা পর্যায়ের সরকারি হাসপাতাল ও জরুরি স্বাস্থ্যসেবা তথ্য।", "শেরপুর সদর হাসপাতাল রোড", "02999-55555", "২৪ ঘণ্টা জরুরি বিভাগ", "green", "https://maps.google.com/?q=Sherpur+District+Hospital"],
    ["sherpur-fire-service", categoryId.emergency, locationId["sherpur-sadar"], "শেরপুর ফায়ার সার্ভিস", "Sherpur Fire Service", "অগ্নিনির্বাপণ, উদ্ধার ও জরুরি সহায়তার জন্য দ্রুত যোগাযোগ করুন।", "শেরপুর সদর, ফায়ার সার্ভিস রোড", "999", "২৪/৭ জরুরি সেবা", "red", "https://maps.google.com/?q=Sherpur+Fire+Service"],
    ["sherpur-blood-bank", categoryId.blood, locationId["sherpur-sadar"], "শেরপুর ব্লাড ব্যাংক", "Sherpur Blood Bank", "রক্তের গ্রুপ খোঁজা ও রক্তদানের তথ্যের demo directory entry।", "শেরপুর সদর হাসপাতাল কমপ্লেক্স", "01700-111222", "সকাল ৮টা – রাত ১০টা", "red", "https://maps.google.com/?q=Sherpur+Hospital"],
    ["district-administration-office", categoryId.government, locationId["sherpur-sadar"], "জেলা প্রশাসকের কার্যালয়", "District Administration Office", "সরকারি অফিস, নাগরিক সেবা ও প্রয়োজনীয় যোগাযোগের তথ্য।", "জেলা প্রশাসকের কার্যালয়, শেরপুর", "02999-60000", "রবি – বৃহস্পতি, ৯টা – ৫টা", "green", "https://maps.google.com/?q=Sherpur+District+Administration"],
    ["madhutila-eco-park", categoryId.tourism, locationId.nalitabari, "মধুটিলা ইকোপার্ক", "Madhutila Eco Park", "শেরপুরের জনপ্রিয় পাহাড়ি সবুজ গন্তব্য ও প্রকৃতি ভ্রমণের guide entry।", "নালিতাবাড়ী, শেরপুর", "01700-333444", "প্রতিদিন, সকাল ৮টা – সন্ধ্যা ৬টা", demoImage, "https://maps.google.com/?q=Madhutila+Eco+Park"],
    ["gajni-obokash-kendra", categoryId.tourism, locationId.jhenaigati, "গজনী অবকাশ কেন্দ্র", "Gajni Obokash Kendra", "ঝিনাইগাতীর পাহাড়, বন ও অবকাশযাপনের একটি local discovery entry।", "ঝিনাইগাতী, শেরপুর", "01700-555666", "প্রতিদিন, সকাল ৮টা – সন্ধ্যা ৬টা", alternateImage, "https://maps.google.com/?q=Gajni+Obokash+Kendra"],
  ];
  for (const row of services) {
    await connection.execute(
      "INSERT INTO serviceListings (slug, categoryId, locationId, nameBn, nameEn, shortDescriptionBn, addressBn, phone, hoursBn, imageUrl, mapUrl, status, isVerified, sortOrder, isDemo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', false, 0, true) ON DUPLICATE KEY UPDATE categoryId=VALUES(categoryId), locationId=VALUES(locationId), nameBn=VALUES(nameBn), nameEn=VALUES(nameEn), shortDescriptionBn=VALUES(shortDescriptionBn), addressBn=VALUES(addressBn), phone=VALUES(phone), hoursBn=VALUES(hoursBn), imageUrl=VALUES(imageUrl), mapUrl=VALUES(mapUrl), status='published', isDemo=true",
      row,
    );
  }

  const notices = [
    ["health-camp-demo", "শেরপুরে বিনামূল্যে স্বাস্থ্য ক্যাম্প — Demo তথ্য", "জেলা স্বাস্থ্য বিভাগের একটি sample announcement। Production-এ প্রকাশের আগে source ও schedule যাচাই করুন।", "SPCare Demo Content", "important"],
    ["emergency-numbers-demo", "জরুরি সহায়তা নম্বর একসঙ্গে", "ফায়ার সার্ভিস, অ্যাম্বুলেন্স ও জরুরি সহায়তার গুরুত্বপূর্ণ নম্বরগুলো এক জায়গায় রাখার demo notice।", "SPCare Demo Content", "urgent"],
    ["tourism-weekend-demo", "সাপ্তাহিক ছুটিতে স্থানীয় ভ্রমণ গাইড", "মধুটিলা ও গজনী ভ্রমণের আগে সময়সূচি, রাস্তার অবস্থা ও স্থানীয় নির্দেশনা যাচাই করুন।", "SPCare Demo Content", "info"],
  ];
  for (const row of notices) {
    await connection.execute(
      "INSERT INTO notices (slug, titleBn, bodyBn, sourceBn, severity, status, publishAt, isDemo) VALUES (?, ?, ?, ?, ?, 'published', NOW(), true) ON DUPLICATE KEY UPDATE titleBn=VALUES(titleBn), bodyBn=VALUES(bodyBn), sourceBn=VALUES(sourceBn), severity=VALUES(severity), status='published', isDemo=true",
      row,
    );
  }

  const [serviceRows] = await connection.query("SELECT id, slug FROM serviceListings WHERE isDemo=true");
  const serviceMap = Object.fromEntries(serviceRows.map((row) => [row.slug, row.id]));
  const featured = [
    [serviceMap["madhutila-eco-park"], "মধুটিলা ইকোপার্ক", "পর্যটন", "নালিতাবাড়ী, শেরপুর", "ডেমো তথ্য", demoImage, 1],
    [serviceMap["sherpur-district-hospital"], "শেরপুর জেলা হাসপাতাল", "স্বাস্থ্যসেবা", "শেরপুর সদর", "ডেমো তথ্য", alternateImage, 2],
    [serviceMap["gajni-obokash-kendra"], "গজনী অবকাশ কেন্দ্র", "পর্যটন", "ঝিনাইগাতী, শেরপুর", "ডেমো তথ্য", alternateImage, 3],
  ];
  for (const row of featured) {
    await connection.execute(
      "INSERT INTO featuredItems (serviceId, titleBn, tagBn, locationBn, ratingLabel, imageUrl, ctaLabelBn, sortOrder, isActive) VALUES (?, ?, ?, ?, ?, ?, 'বিস্তারিত দেখুন', ?, true) ON DUPLICATE KEY UPDATE titleBn=VALUES(titleBn), tagBn=VALUES(tagBn), locationBn=VALUES(locationBn), ratingLabel=VALUES(ratingLabel), imageUrl=VALUES(imageUrl), sortOrder=VALUES(sortOrder), isActive=true",
      row,
    );
  }

  console.log(JSON.stringify({ seeded: true, categories: categories.length, services: services.length, notices: notices.length, featured: featured.length }));
} finally {
  await connection.end();
}
