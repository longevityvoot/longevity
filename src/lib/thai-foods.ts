// Thai food library — kcal estimates per typical serving.
// Numbers are rough averages from common Thai food tables — designed for
// "good enough" tracking, not lab-grade.
//
// Keywords power the fuzzy search; matching uses substring + keyword hit.

export type FoodCategory =
  | "rice"
  | "noodle"
  | "soup"
  | "salad"
  | "meat"
  | "egg"
  | "veg"
  | "fruit"
  | "drink"
  | "snack"
  | "dessert"
  | "supplement";

export type FoodItem = {
  key: string;
  name: string;
  kcal: number;
  unit: string; // "ชาม" | "จาน" | "แก้ว" | "ลูก" | "ชิ้น" | etc.
  category: FoodCategory;
  keywords: string[]; // english + alt spellings for search
};

export const CATEGORY_LABEL: Record<FoodCategory, string> = {
  rice: "ข้าว",
  noodle: "ก๋วยเตี๋ยว / เส้น",
  soup: "แกง / ต้ม",
  salad: "ยำ / ตำ",
  meat: "เมนูเนื้อ",
  egg: "ไข่",
  veg: "ผัก",
  fruit: "ผลไม้",
  drink: "เครื่องดื่ม",
  snack: "ของว่าง",
  dessert: "ขนมหวาน",
  supplement: "อาหารเสริม / โปรตีน",
};

export const THAI_FOODS: FoodItem[] = [
  // Rice
  { key: "rice-white",   name: "ข้าวสวย",          kcal: 200, unit: "1 ทัพพี", category: "rice",   keywords: ["rice", "ข้าว"] },
  { key: "rice-brown",   name: "ข้าวกล้อง",        kcal: 215, unit: "1 ทัพพี", category: "rice",   keywords: ["brown rice", "กล้อง"] },
  { key: "rice-sticky",  name: "ข้าวเหนียว",      kcal: 240, unit: "1 ทัพพี", category: "rice",   keywords: ["sticky rice", "เหนียว"] },
  { key: "rice-porridge",name: "ข้าวต้มหมูสับ",   kcal: 280, unit: "1 ชาม",  category: "rice",   keywords: ["porridge", "ข้าวต้ม"] },
  { key: "rice-fried",   name: "ข้าวผัด",          kcal: 520, unit: "1 จาน",  category: "rice",   keywords: ["fried rice", "ผัด"] },
  { key: "rice-chicken", name: "ข้าวมันไก่",      kcal: 620, unit: "1 จาน",  category: "rice",   keywords: ["chicken rice", "มันไก่"] },
  { key: "rice-pork",    name: "ข้าวหมูแดง",      kcal: 560, unit: "1 จาน",  category: "rice",   keywords: ["red pork rice", "หมูแดง"] },
  { key: "rice-duck",    name: "ข้าวหน้าเป็ด",     kcal: 580, unit: "1 จาน",  category: "rice",   keywords: ["duck rice", "เป็ด"] },
  { key: "rice-kapao-moo-egg",  name: "ข้าวกะเพราหมูสับไข่ดาว", kcal: 720, unit: "1 จาน", category: "rice", keywords: ["kapao", "กะเพรา", "basil", "ไข่ดาว"] },
  { key: "rice-kapao-gai",      name: "ข้าวกะเพราไก่",         kcal: 580, unit: "1 จาน", category: "rice", keywords: ["kapao", "กะเพรา", "chicken"] },
  { key: "rice-kapao-gai-egg",  name: "ข้าวกะเพราไก่ไข่ดาว",    kcal: 690, unit: "1 จาน", category: "rice", keywords: ["kapao", "กะเพรา", "ไก่", "ไข่ดาว"] },
  { key: "rice-kapao-moo-grob", name: "ข้าวกะเพราหมูกรอบ",     kcal: 780, unit: "1 จาน", category: "rice", keywords: ["kapao", "กะเพรา", "หมูกรอบ"] },
  { key: "rice-kapao-seafood",  name: "ข้าวกะเพราทะเล",        kcal: 620, unit: "1 จาน", category: "rice", keywords: ["kapao", "กะเพรา", "ทะเล", "seafood"] },
  { key: "rice-kapao-moo",      name: "ข้าวกะเพราหมูสับ",       kcal: 600, unit: "1 จาน", category: "rice", keywords: ["kapao", "กะเพรา", "หมูสับ"] },
  { key: "rice-omelet",         name: "ข้าวไข่เจียว",          kcal: 480, unit: "1 จาน", category: "rice", keywords: ["omelet rice", "ไข่เจียว"] },
  { key: "rice-omelet-moo",     name: "ข้าวไข่เจียวหมูสับ",     kcal: 590, unit: "1 จาน", category: "rice", keywords: ["omelet", "หมูสับ"] },
  { key: "rice-kana-moo-grob",  name: "ข้าวคะน้าหมูกรอบ",      kcal: 680, unit: "1 จาน", category: "rice", keywords: ["kana", "หมูกรอบ"] },
  { key: "rice-kha-moo",        name: "ข้าวขาหมู",             kcal: 720, unit: "1 จาน", category: "rice", keywords: ["khao kha moo", "ขาหมู"] },
  { key: "rice-pad-prik",       name: "ข้าวผัดพริกขิงหมูกรอบ", kcal: 650, unit: "1 จาน", category: "rice", keywords: ["prik khing"] },
  { key: "rice-grapow-tofu",    name: "ข้าวกะเพราเต้าหู้",      kcal: 480, unit: "1 จาน", category: "rice", keywords: ["kapao", "เต้าหู้"] },
  { key: "khao-soi",            name: "ข้าวซอยไก่",            kcal: 580, unit: "1 ชาม", category: "rice", keywords: ["khao soi"] },
  { key: "rice-curry",          name: "ข้าวราดแกง 1 อย่าง",    kcal: 550, unit: "1 จาน", category: "rice", keywords: ["curry rice", "ราดแกง"] },
  { key: "rice-curry-2",        name: "ข้าวราดแกง 2 อย่าง",    kcal: 680, unit: "1 จาน", category: "rice", keywords: ["curry rice 2", "ราดแกง 2"] },
  { key: "rice-mama",           name: "ข้าวผัดมาม่า",          kcal: 540, unit: "1 จาน", category: "rice", keywords: ["fried mama"] },
  { key: "rice-pork-leg",       name: "ข้าวคะน้าปลาเค็ม",       kcal: 480, unit: "1 จาน", category: "rice", keywords: ["pla khem"] },
  { key: "rice-chicken-tod",    name: "ข้าวไก่ทอด",            kcal: 620, unit: "1 จาน", category: "rice", keywords: ["fried chicken rice"] },
  { key: "rice-shrimp-tom",     name: "ข้าวต้มกุ้ง",           kcal: 320, unit: "1 ชาม", category: "rice", keywords: ["porridge shrimp"] },
  { key: "joke",                name: "โจ๊กหมู",              kcal: 280, unit: "1 ชาม", category: "rice", keywords: ["jok", "joke"] },
  { key: "joke-egg",            name: "โจ๊กหมูใส่ไข่",         kcal: 360, unit: "1 ชาม", category: "rice", keywords: ["jok", "joke"] },
  { key: "kai-grata",           name: "ไข่กระทะ",             kcal: 480, unit: "1 ที่",  category: "rice", keywords: ["kai grata"] },

  // Noodle
  { key: "noodle-namtok", name: "ก๋วยเตี๋ยวน้ำตก",   kcal: 420, unit: "1 ชาม",  category: "noodle", keywords: ["namtok"] },
  { key: "noodle-tomyum", name: "ก๋วยเตี๋ยวต้มยำ",   kcal: 450, unit: "1 ชาม",  category: "noodle", keywords: ["tomyum"] },
  { key: "noodle-clear",  name: "ก๋วยเตี๋ยวน้ำใส",   kcal: 380, unit: "1 ชาม",  category: "noodle", keywords: ["clear noodle"] },
  { key: "noodle-egg",    name: "บะหมี่หมูแดง",      kcal: 450, unit: "1 ชาม",  category: "noodle", keywords: ["egg noodle"] },
  { key: "noodle-yen-ta-fo",name:"เย็นตาโฟ",         kcal: 480, unit: "1 ชาม",  category: "noodle", keywords: ["yen ta fo"] },
  { key: "noodle-pad-thai",name:"ผัดไทย",            kcal: 530, unit: "1 จาน",  category: "noodle", keywords: ["pad thai"] },
  { key: "noodle-radna",  name: "ราดหน้า",          kcal: 580, unit: "1 จาน",  category: "noodle", keywords: ["rad na"] },
  { key: "noodle-pad-see-ew",name:"ผัดซีอิ๊ว",       kcal: 540, unit: "1 จาน",  category: "noodle", keywords: ["pad see ew"] },
  { key: "instant-noodle",name: "บะหมี่กึ่งสำเร็จ",   kcal: 380, unit: "1 ซอง",  category: "noodle", keywords: ["instant", "mama"] },
  { key: "kuay-jub",      name: "ก๋วยจั๊บญวน",        kcal: 420, unit: "1 ชาม",  category: "noodle", keywords: ["kuay jub"] },
  { key: "kuay-jub-th",   name: "ก๋วยจั๊บน้ำข้น",    kcal: 460, unit: "1 ชาม",  category: "noodle", keywords: ["kuay jub thai"] },
  { key: "noodle-keo",    name: "เกี๊ยวน้ำ",         kcal: 380, unit: "1 ชาม",  category: "noodle", keywords: ["keo nam"] },
  { key: "noodle-keo-hang",name:"เกี๊ยวแห้ง",         kcal: 360, unit: "1 จาน",  category: "noodle", keywords: ["keo haeng"] },
  { key: "noodle-bamee-keo",name:"บะหมี่เกี๊ยว",      kcal: 460, unit: "1 ชาม",  category: "noodle", keywords: ["bamee keo"] },
  { key: "noodle-bamee-hang",name:"บะหมี่หมูแดงแห้ง",  kcal: 480, unit: "1 จาน",  category: "noodle", keywords: ["bamee haeng"] },
  { key: "noodle-suki",   name: "สุกี้น้ำ",          kcal: 380, unit: "1 ชาม",  category: "noodle", keywords: ["suki"] },
  { key: "noodle-suki-haeng",name:"สุกี้แห้ง",         kcal: 420, unit: "1 จาน",  category: "noodle", keywords: ["suki haeng"] },
  { key: "noodle-boat",   name: "ก๋วยเตี๋ยวเรือ",    kcal: 380, unit: "1 ชาม",  category: "noodle", keywords: ["boat noodle"] },

  // Soup / curry
  { key: "tomyum-kung",   name: "ต้มยำกุ้ง",         kcal: 280, unit: "1 ถ้วย",  category: "soup",   keywords: ["tom yum"] },
  { key: "tom-kha",       name: "ต้มข่าไก่",         kcal: 320, unit: "1 ถ้วย",  category: "soup",   keywords: ["tom kha"] },
  { key: "green-curry",   name: "แกงเขียวหวานไก่",    kcal: 380, unit: "1 ถ้วย",  category: "soup",   keywords: ["green curry"] },
  { key: "red-curry",     name: "แกงเผ็ดเป็ดย่าง",     kcal: 420, unit: "1 ถ้วย",  category: "soup",   keywords: ["red curry"] },
  { key: "massaman",      name: "แกงมัสมั่นเนื้อ",     kcal: 460, unit: "1 ถ้วย",  category: "soup",   keywords: ["massaman"] },
  { key: "tom-jued",      name: "ต้มจืดหมูสับ",       kcal: 180, unit: "1 ถ้วย",  category: "soup",   keywords: ["tom jued"] },
  { key: "tom-jued-tofu", name: "ต้มจืดเต้าหู้",      kcal: 160, unit: "1 ถ้วย",  category: "soup",   keywords: ["tom jued tofu"] },
  { key: "tom-jued-tang", name: "ต้มจืดแตงร่มฟ้า",    kcal: 150, unit: "1 ถ้วย",  category: "soup",   keywords: ["tom jued melon"] },
  { key: "gaeng-som",     name: "แกงส้ม",            kcal: 220, unit: "1 ถ้วย",  category: "soup",   keywords: ["gaeng som"] },
  { key: "gaeng-keow-pork",name:"แกงเขียวหวานหมู",   kcal: 380, unit: "1 ถ้วย",  category: "soup",   keywords: ["green curry pork"] },
  { key: "gaeng-paneang", name: "พะแนงไก่",          kcal: 410, unit: "1 ถ้วย",  category: "soup",   keywords: ["panaeng"] },
  { key: "gaeng-leuang",  name: "แกงเหลือง",         kcal: 220, unit: "1 ถ้วย",  category: "soup",   keywords: ["gaeng leuang"] },
  { key: "tom-saeb",      name: "ต้มแซ่บ",           kcal: 230, unit: "1 ถ้วย",  category: "soup",   keywords: ["tom saeb"] },

  // Salad / yum / tam
  { key: "som-tam",       name: "ส้มตำไทย",          kcal: 230, unit: "1 จาน",  category: "salad",  keywords: ["som tam", "papaya salad"] },
  { key: "som-tam-pu",    name: "ส้มตำปูปลาร้า",     kcal: 270, unit: "1 จาน",  category: "salad",  keywords: ["som tam pu"] },
  { key: "yum-woonsen",   name: "ยำวุ้นเส้น",        kcal: 290, unit: "1 จาน",  category: "salad",  keywords: ["yum woonsen"] },
  { key: "laab",          name: "ลาบหมู",             kcal: 220, unit: "1 จาน",  category: "salad",  keywords: ["laab", "larb"] },
  { key: "namtok-moo",    name: "น้ำตกหมู",          kcal: 250, unit: "1 จาน",  category: "salad",  keywords: ["namtok"] },
  { key: "salad-green",   name: "สลัดผัก",           kcal: 180, unit: "1 จาน",  category: "salad",  keywords: ["green salad"] },
  { key: "som-tam-thai",  name: "ส้มตำไทยใส่กุ้งสด",   kcal: 280, unit: "1 จาน",  category: "salad",  keywords: ["som tam shrimp"] },
  { key: "som-tam-poo-pa-ra",name:"ส้มตำลาว (ปลาร้า)", kcal: 260, unit: "1 จาน", category: "salad",  keywords: ["som tam pla ra"] },
  { key: "yum-moo-yor",   name: "ยำหมูยอ",           kcal: 280, unit: "1 จาน",  category: "salad",  keywords: ["yum moo yor"] },
  { key: "yum-mama",      name: "ยำมาม่า",          kcal: 350, unit: "1 จาน",  category: "salad",  keywords: ["yum mama"] },
  { key: "yum-tale",      name: "ยำทะเล",           kcal: 280, unit: "1 จาน",  category: "salad",  keywords: ["yum talay"] },
  { key: "laab-gai",      name: "ลาบไก่",            kcal: 200, unit: "1 จาน",  category: "salad",  keywords: ["laab gai"] },
  { key: "laab-tofu",     name: "ลาบเต้าหู้",        kcal: 180, unit: "1 จาน",  category: "salad",  keywords: ["laab tofu"] },

  // Meat dishes
  { key: "moo-yang",      name: "หมูย่าง",           kcal: 280, unit: "1 จาน",  category: "meat",   keywords: ["grilled pork"] },
  { key: "kor-moo-yang",  name: "คอหมูย่าง",         kcal: 320, unit: "1 จาน",  category: "meat",   keywords: ["pork neck"] },
  { key: "gai-yang",      name: "ไก่ย่าง",           kcal: 260, unit: "1/2 ตัว",category: "meat",   keywords: ["grilled chicken"] },
  { key: "gai-tod",       name: "ไก่ทอด",            kcal: 320, unit: "1 ชิ้น",  category: "meat",   keywords: ["fried chicken"] },
  { key: "moo-kratiem",   name: "หมูทอดกระเทียม",   kcal: 350, unit: "1 จาน",  category: "meat",   keywords: ["pork garlic"] },
  { key: "pla-rad-prik",  name: "ปลาราดพริก",        kcal: 380, unit: "1 จาน",  category: "meat",   keywords: ["fish chili"] },
  { key: "pla-nueng",     name: "ปลานึ่งซีอิ๊ว",       kcal: 280, unit: "1 จาน",  category: "meat",   keywords: ["steamed fish"] },
  { key: "pla-too-tod",   name: "ปลาทูทอด",          kcal: 220, unit: "1 ตัว",   category: "meat",   keywords: ["fried pla too"] },
  { key: "pla-tab-tim",   name: "ปลาทับทิม นึ่งมะนาว", kcal: 320, unit: "1 ตัว",  category: "meat",   keywords: ["tilapia"] },
  { key: "moo-grob",      name: "หมูกรอบ",            kcal: 380, unit: "100g",   category: "meat",   keywords: ["moo grob", "crispy pork"] },
  { key: "moo-toon",      name: "หมูตุ๋นเครื่องยาจีน",  kcal: 280, unit: "1 ถ้วย",  category: "meat",   keywords: ["pork stew"] },
  { key: "gai-pad-met",   name: "ไก่ผัดเม็ดมะม่วง",   kcal: 380, unit: "1 จาน",  category: "meat",   keywords: ["cashew chicken"] },
  { key: "steak",         name: "สเต๊กเนื้อ",         kcal: 480, unit: "1 จาน",  category: "meat",   keywords: ["steak"] },
  { key: "kao-mok-gai",   name: "ข้าวหมกไก่",        kcal: 540, unit: "1 จาน",  category: "rice",   keywords: ["khao mok"] },

  // Egg
  { key: "egg-boiled",    name: "ไข่ต้ม",             kcal: 78,  unit: "1 ฟอง",  category: "egg",    keywords: ["boiled egg"] },
  { key: "egg-fried",     name: "ไข่ดาว",             kcal: 110, unit: "1 ฟอง",  category: "egg",    keywords: ["fried egg"] },
  { key: "egg-omelet",    name: "ไข่เจียว",           kcal: 220, unit: "1 ฟอง",  category: "egg",    keywords: ["omelet"] },
  { key: "egg-omelet-moo",name: "ไข่เจียวหมูสับ",     kcal: 320, unit: "1 ฟอง",  category: "egg",    keywords: ["omelet pork"] },
  { key: "egg-scramble",  name: "ไข่ขูดเนย",          kcal: 180, unit: "2 ฟอง",  category: "egg",    keywords: ["scrambled egg"] },
  { key: "egg-poached",   name: "ไข่ลวก",             kcal: 70,  unit: "1 ฟอง",  category: "egg",    keywords: ["poached"] },
  { key: "egg-yum",       name: "ไข่เยี่ยวม้าทรงเครื่อง",kcal: 220,unit: "1 ฟอง",   category: "egg",    keywords: ["yum khai"] },

  // Veg
  { key: "pak-boong",     name: "ผัดผักบุ้งไฟแดง",    kcal: 180, unit: "1 จาน",  category: "veg",    keywords: ["morning glory"] },
  { key: "pak-tom",       name: "ผักลวก",             kcal: 60,  unit: "1 จาน",  category: "veg",    keywords: ["boiled veg"] },
  { key: "pak-yang",      name: "ผักย่าง",            kcal: 80,  unit: "1 จาน",  category: "veg",    keywords: ["grilled veg"] },
  { key: "broccoli-pad",  name: "ผัดบรอกโคลีน้ำมันหอย", kcal: 180, unit: "1 จาน",  category: "veg",    keywords: ["broccoli"] },
  { key: "pak-kana",      name: "ผัดคะน้าน้ำมันหอย",   kcal: 160, unit: "1 จาน",  category: "veg",    keywords: ["kana"] },
  { key: "kana-moo-grob", name: "คะน้าหมูกรอบ",       kcal: 350, unit: "1 จาน",  category: "veg",    keywords: ["kana moo grob"] },
  { key: "tofu-pad",      name: "ผัดเต้าหู้",         kcal: 220, unit: "1 จาน",  category: "veg",    keywords: ["tofu stir fry"] },
  { key: "veg-tempura",   name: "ผักทอด (เทมปุระ)",    kcal: 280, unit: "1 จาน",  category: "veg",    keywords: ["tempura veg"] },

  // Fruit
  { key: "fruit-banana",  name: "กล้วยหอม",          kcal: 90,  unit: "1 ลูก",   category: "fruit",  keywords: ["banana"] },
  { key: "fruit-apple",   name: "แอปเปิ้ล",          kcal: 80,  unit: "1 ลูก",   category: "fruit",  keywords: ["apple"] },
  { key: "fruit-orange",  name: "ส้ม",                kcal: 50,  unit: "1 ลูก",   category: "fruit",  keywords: ["orange"] },
  { key: "fruit-mango",   name: "มะม่วงสุก",         kcal: 150, unit: "1/2 ลูก", category: "fruit",  keywords: ["mango"] },
  { key: "fruit-papaya",  name: "มะละกอสุก",         kcal: 60,  unit: "1 จาน",   category: "fruit",  keywords: ["papaya"] },
  { key: "fruit-watermelon",name:"แตงโม",           kcal: 45,  unit: "1 ชิ้น",  category: "fruit",  keywords: ["watermelon"] },
  { key: "fruit-pineapple",name:"สับปะรด",           kcal: 60,  unit: "1 ชิ้น",  category: "fruit",  keywords: ["pineapple"] },
  { key: "fruit-mixed",   name: "ผลไม้รวม",          kcal: 120, unit: "1 จาน",   category: "fruit",  keywords: ["mixed fruit"] },
  { key: "fruit-durian",  name: "ทุเรียน",           kcal: 250, unit: "1 เม็ด",   category: "fruit",  keywords: ["durian"] },
  { key: "fruit-mangosteen",name:"มังคุด",            kcal: 80,  unit: "3 ผล",   category: "fruit",  keywords: ["mangosteen"] },
  { key: "fruit-rambutan",name: "เงาะ",              kcal: 65,  unit: "5 ผล",   category: "fruit",  keywords: ["rambutan"] },
  { key: "fruit-grape",   name: "องุ่น",             kcal: 70,  unit: "1 พวง",  category: "fruit",  keywords: ["grape"] },
  { key: "fruit-guava",   name: "ฝรั่ง",              kcal: 60,  unit: "1 ลูก",   category: "fruit",  keywords: ["guava"] },
  { key: "fruit-dragon",  name: "แก้วมังกร",         kcal: 70,  unit: "1/2 ลูก", category: "fruit",  keywords: ["dragon fruit"] },

  // Drinks
  { key: "water",         name: "น้ำเปล่า",            kcal: 0,   unit: "1 แก้ว",  category: "drink",  keywords: ["water"] },
  { key: "coffee-black",  name: "กาแฟดำ",             kcal: 5,   unit: "1 แก้ว",  category: "drink",  keywords: ["black coffee", "americano"] },
  { key: "coffee-latte",  name: "ลาเต้",              kcal: 180, unit: "1 แก้ว",  category: "drink",  keywords: ["latte"] },
  { key: "coffee-iced",   name: "กาแฟเย็น",           kcal: 280, unit: "1 แก้ว",  category: "drink",  keywords: ["iced coffee"] },
  { key: "tea-thai",      name: "ชาไทยเย็น",          kcal: 280, unit: "1 แก้ว",  category: "drink",  keywords: ["thai tea"] },
  { key: "tea-green",     name: "ชาเขียวเย็น",        kcal: 140, unit: "1 แก้ว",  category: "drink",  keywords: ["green tea"] },
  { key: "tea-plain",     name: "ชาร้อน (ไม่ใส่น้ำตาล)", kcal: 5, unit: "1 แก้ว",  category: "drink",  keywords: ["plain tea"] },
  { key: "milk-cow",      name: "นมจืด",              kcal: 150, unit: "1 แก้ว",  category: "drink",  keywords: ["milk"] },
  { key: "soy-milk",      name: "นมถั่วเหลือง",       kcal: 100, unit: "1 แก้ว",  category: "drink",  keywords: ["soy milk"] },
  { key: "soda-coke",     name: "โค้ก",                kcal: 140, unit: "1 กระป๋อง",category: "drink", keywords: ["coke", "soda"] },
  { key: "juice-orange",  name: "น้ำส้ม",              kcal: 110, unit: "1 แก้ว",  category: "drink",  keywords: ["orange juice"] },
  { key: "beer",          name: "เบียร์",              kcal: 150, unit: "1 ขวด",   category: "drink",  keywords: ["beer"] },
  { key: "wine",          name: "ไวน์แดง",            kcal: 125, unit: "1 แก้ว",  category: "drink",  keywords: ["wine"] },
  { key: "milk-fresh",    name: "นมสด",              kcal: 150, unit: "1 แก้ว",  category: "drink",  keywords: ["fresh milk"] },
  { key: "milk-lowfat",   name: "นมไขมันต่ำ",        kcal: 100, unit: "1 แก้ว",  category: "drink",  keywords: ["low fat milk"] },
  { key: "yakult",        name: "ยาคูลท์",           kcal: 50,  unit: "1 ขวด",   category: "drink",  keywords: ["yakult"] },
  { key: "milo",          name: "ไมโลเย็น",          kcal: 220, unit: "1 แก้ว",  category: "drink",  keywords: ["milo"] },
  { key: "ovaltine",      name: "โอวัลตินร้อน",       kcal: 180, unit: "1 แก้ว",  category: "drink",  keywords: ["ovaltine"] },
  { key: "smoothie-banana",name:"กล้วยปั่น",         kcal: 240, unit: "1 แก้ว",  category: "drink",  keywords: ["smoothie"] },
  { key: "coconut-water", name: "น้ำมะพร้าว",        kcal: 60,  unit: "1 ลูก",   category: "drink",  keywords: ["coconut water"] },
  { key: "soda-pepsi",    name: "เป๊ปซี่",            kcal: 140, unit: "1 กระป๋อง",category: "drink", keywords: ["pepsi"] },
  { key: "soda-sprite",   name: "สไปรท์",            kcal: 140, unit: "1 กระป๋อง",category: "drink", keywords: ["sprite"] },

  // Snacks
  { key: "bread-toast",   name: "ขนมปังปิ้งเนยน้ำตาล", kcal: 180, unit: "2 แผ่น",  category: "snack",  keywords: ["toast"] },
  { key: "sandwich-ham",  name: "แซนด์วิชแฮม",      kcal: 320, unit: "1 ชิ้น",  category: "snack",  keywords: ["sandwich"] },
  { key: "chips",         name: "มันฝรั่งทอด",       kcal: 250, unit: "1 ห่อ",   category: "snack",  keywords: ["chips"] },
  { key: "popcorn",       name: "ป๊อปคอร์น",         kcal: 200, unit: "1 ถ้วย",  category: "snack",  keywords: ["popcorn"] },
  { key: "popia-tod",     name: "ปอเปี๊ยะทอด",       kcal: 180, unit: "3 ชิ้น",  category: "snack",  keywords: ["spring roll fried"] },
  { key: "popia-sod",     name: "ปอเปี๊ยะสด",         kcal: 150, unit: "1 ม้วน",  category: "snack",  keywords: ["spring roll fresh"] },
  { key: "moo-ping",      name: "หมูปิ้ง + ข้าวเหนียว", kcal: 320, unit: "2 ไม้+1 ห่อ", category: "snack", keywords: ["moo ping"] },
  { key: "sai-krok",      name: "ไส้กรอกอีสาน",      kcal: 250, unit: "2 ลูก",   category: "snack",  keywords: ["sai krok"] },
  { key: "luk-chin-ping", name: "ลูกชิ้นปิ้ง",       kcal: 220, unit: "4 ลูก",   category: "snack",  keywords: ["luk chin"] },
  { key: "salapao",       name: "ซาลาเปาไส้หมูแดง",   kcal: 200, unit: "1 ลูก",   category: "snack",  keywords: ["salapao"] },
  { key: "kanom-pang-nung",name:"ขนมปังปิ้งสังขยา",  kcal: 280, unit: "2 แผ่น",  category: "snack",  keywords: ["sangkhaya toast"] },
  { key: "kanom-jeen-namya",name:"ขนมจีนน้ำยา",      kcal: 380, unit: "1 จาน",  category: "noodle", keywords: ["kanom jeen"] },
  { key: "donut",         name: "โดนัท",             kcal: 280, unit: "1 ชิ้น",  category: "dessert",keywords: ["donut"] },
  { key: "cake-choc",     name: "ช็อกโกแลตเค้ก",    kcal: 380, unit: "1 ชิ้น",  category: "dessert",keywords: ["chocolate cake"] },
  { key: "ice-cream",     name: "ไอศกรีม",           kcal: 220, unit: "1 ลูก",   category: "dessert",keywords: ["ice cream"] },
  { key: "manggwan",      name: "ข้าวเหนียวมะม่วง",   kcal: 520, unit: "1 จาน",  category: "dessert",keywords: ["mango sticky rice"] },
  { key: "bua-loy",       name: "บัวลอย",             kcal: 280, unit: "1 ถ้วย",  category: "dessert",keywords: ["bua loy"] },
  { key: "tako",          name: "ตะโก้",              kcal: 120, unit: "1 ชิ้น",  category: "dessert",keywords: ["tako"] },
  { key: "lod-chong",     name: "ลอดช่อง",           kcal: 220, unit: "1 ถ้วย",  category: "dessert",keywords: ["lod chong"] },
  { key: "kanom-krok",    name: "ขนมครก",            kcal: 180, unit: "5 ชิ้น",  category: "dessert",keywords: ["kanom krok"] },
  { key: "saku",          name: "สาคูไส้หมู",         kcal: 130, unit: "3 ชิ้น",  category: "dessert",keywords: ["sakoo"] },
  { key: "kanom-tako",    name: "ขนมเปียกปูน",       kcal: 100, unit: "1 ชิ้น",  category: "dessert",keywords: ["kanom piek poon"] },

  // Common Western
  { key: "burger",        name: "เบอร์เกอร์เนื้อ",     kcal: 550, unit: "1 ชิ้น",  category: "meat",   keywords: ["burger"] },
  { key: "pizza",         name: "พิซซ่า",            kcal: 280, unit: "1 ชิ้น",  category: "snack",  keywords: ["pizza"] },
  { key: "pasta-cream",   name: "พาสต้าครีม",        kcal: 580, unit: "1 จาน",  category: "noodle", keywords: ["pasta", "carbonara"] },
  { key: "salad-caesar",  name: "ซีซาร์สลัด",        kcal: 320, unit: "1 จาน",  category: "salad",  keywords: ["caesar salad"] },

  // Protein supplements — kcal per typical serving. Macros vary by brand;
  // numbers below are mid-range averages across common Thai-market SKUs.
  // Mix with water (no extra kcal). Adding skim milk adds ~80 kcal/cup.
  { key: "bodykey-shake",        name: "BodyKey Meal Shake (Amway)",     kcal: 215, unit: "1 ซอง (~50g)",  category: "supplement", keywords: ["bodykey", "body key", "บอดี้คีย์", "บอดี้คีย", "บอดี้ คีย์", "amway", "แอมเวย์", "meal replacement", "นูทริไลท์", "shake", "เชค"] },
  { key: "bodykey-meal-bar",     name: "BodyKey Meal Bar (Amway)",        kcal: 220, unit: "1 แท่ง (60g)", category: "supplement", keywords: ["bodykey bar", "บอดี้คีย์ บาร์", "amway bar", "แอมเวย์ บาร์", "meal bar"] },
  { key: "bodykey-snack-bar",    name: "BodyKey Snack Bar (Amway)",       kcal: 150, unit: "1 แท่ง (35g)", category: "supplement", keywords: ["bodykey snack", "บอดี้คีย์ สแน็ค", "amway snack"] },
  { key: "nutrilite-plant-pro",  name: "Nutrilite All Plant Protein",     kcal: 40,  unit: "1 scoop (10g)", category: "supplement", keywords: ["nutrilite", "นูทริไลท์", "amway protein", "แอมเวย์", "plant protein", "soy"] },
  { key: "whey-concentrate",     name: "Whey Protein Concentrate",        kcal: 120, unit: "1 scoop (30g)", category: "supplement", keywords: ["whey", "เวย์", "concentrate", "wpc"] },
  { key: "whey-isolate",         name: "Whey Protein Isolate",            kcal: 110, unit: "1 scoop (30g)", category: "supplement", keywords: ["whey isolate", "เวย์ไอโซเลต", "wpi"] },
  { key: "whey-hydrolyzed",      name: "Whey Hydrolyzed",                 kcal: 105, unit: "1 scoop (30g)", category: "supplement", keywords: ["hydrolyzed whey", "wph"] },
  { key: "casein-protein",       name: "Casein Protein",                  kcal: 120, unit: "1 scoop (30g)", category: "supplement", keywords: ["casein", "เคซีน", "เคซีน"] },
  { key: "plant-protein-blend",  name: "Plant Protein (ถั่ว/ข้าว/กัญชง)",  kcal: 120, unit: "1 scoop (30g)", category: "supplement", keywords: ["plant protein", "pea", "rice", "vegan"] },
  { key: "soy-protein-isolate",  name: "Soy Protein Isolate",             kcal: 110, unit: "1 scoop (30g)", category: "supplement", keywords: ["soy protein", "ถั่วเหลือง"] },
  { key: "collagen-peptides",    name: "Collagen Peptides",               kcal: 40,  unit: "1 scoop (10g)", category: "supplement", keywords: ["collagen", "คอลลาเจน"] },
  { key: "mass-gainer",          name: "Mass Gainer (high carb)",         kcal: 600, unit: "1 serving (~150g)", category: "supplement", keywords: ["mass gainer", "weight gainer", "เพิ่มน้ำหนัก"] },
  { key: "egg-white-protein",    name: "Egg White Protein",               kcal: 110, unit: "1 scoop (30g)", category: "supplement", keywords: ["egg white", "albumin", "ไข่ขาว"] },
  { key: "bcaa-drink",           name: "BCAA (no calorie)",               kcal: 5,   unit: "1 แก้ว",       category: "supplement", keywords: ["bcaa", "amino"] },
  { key: "pre-workout",          name: "Pre-Workout (no sugar)",          kcal: 10,  unit: "1 แก้ว",       category: "supplement", keywords: ["pre workout", "preworkout", "พรีเวิร์ค"] },
  { key: "protein-bar-generic",  name: "Protein Bar (ทั่วไป)",            kcal: 200, unit: "1 แท่ง (60g)", category: "supplement", keywords: ["protein bar", "โปรตีนบาร์"] },
  { key: "protein-shake-rtd",    name: "Protein Shake พร้อมดื่ม (RTD)",    kcal: 160, unit: "1 ขวด (350ml)", category: "supplement", keywords: ["rtd", "ready to drink", "shake"] },
];

export function searchFoods(query: string, limit = 30): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return THAI_FOODS.slice(0, limit);
  return THAI_FOODS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.keywords.some((k) => k.toLowerCase().includes(q)),
  ).slice(0, limit);
}

export function foodByKey(key: string): FoodItem | undefined {
  return THAI_FOODS.find((f) => f.key === key);
}
