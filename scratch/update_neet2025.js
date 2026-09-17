const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const examId = "798b1e69-77ab-4083-916c-ed28f1ebd03d";
const fixesDir = path.join(__dirname, "neet2025_fixes");

async function uploadFile(localName, storagePath) {
  const filePath = path.join(fixesDir, localName);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }
  const fileBuffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from("pyq-images")
    .upload(storagePath, fileBuffer, {
      contentType: "image/png",
      upsert: true
    });

  if (error) {
    console.error(`Error uploading ${storagePath}:`, error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("pyq-images")
    .getPublicUrl(storagePath);

  const finalUrl = `${publicUrl}?v=${Date.now()}`;
  console.log(`Uploaded ${localName} -> ${finalUrl}`);
  return finalUrl;
}

async function run() {
  console.log("Starting NEET 2025 image uploads and DB updates...");

  // Upload all generated vector images
  const uploads = {
    q041_q: await uploadFile("q041-question-image.png", "neet-ug-2025/structured/q041-question-image.png"),
    q045_q: await uploadFile("q045-question-image.png", "neet-ug-2025/structured/q045-question-image.png"),

    q064_a: await uploadFile("q064-option-a-image.png", "neet-ug-2025/structured/q064-option-a-image.png"),
    q064_b: await uploadFile("q064-option-b-image.png", "neet-ug-2025/structured/q064-option-b-image.png"),
    q064_c: await uploadFile("q064-option-c-image.png", "neet-ug-2025/structured/q064-option-c-image.png"),
    q064_d: await uploadFile("q064-option-d-image.png", "neet-ug-2025/structured/q064-option-d-image.png"),

    q081_a: await uploadFile("q081-option-a-image.png", "neet-ug-2025/structured/q081-option-a-image.png"),
    q081_b: await uploadFile("q081-option-b-image.png", "neet-ug-2025/structured/q081-option-b-image.png"),
    q081_c: await uploadFile("q081-option-c-image.png", "neet-ug-2025/structured/q081-option-c-image.png"),
    q081_d: await uploadFile("q081-option-d-image.png", "neet-ug-2025/structured/q081-option-d-image.png"),

    q082_q: await uploadFile("q082-question-image.png", "neet-ug-2025/structured/q082-question-image.png"),
    q082_a: await uploadFile("q082-option-a-image.png", "neet-ug-2025/structured/q082-option-a-image.png"),
    q082_b: await uploadFile("q082-option-b-image.png", "neet-ug-2025/structured/q082-option-b-image.png"),
    q082_c: await uploadFile("q082-option-c-image.png", "neet-ug-2025/structured/q082-option-c-image.png"),
    q082_d: await uploadFile("q082-option-d-image.png", "neet-ug-2025/structured/q082-option-d-image.png"),

    q090_q: await uploadFile("q090-question-image.png", "neet-ug-2025/structured/q090-question-image.png"),
    q090_a: await uploadFile("q090-option-a-image.png", "neet-ug-2025/structured/q090-option-a-image.png"),
    q090_b: await uploadFile("q090-option-b-image.png", "neet-ug-2025/structured/q090-option-b-image.png"),
    q090_c: await uploadFile("q090-option-c-image.png", "neet-ug-2025/structured/q090-option-c-image.png"),
    q090_d: await uploadFile("q090-option-d-image.png", "neet-ug-2025/structured/q090-option-d-image.png"),

    q164_a: await uploadFile("q164-option-a-image.png", "neet-ug-2025/structured/q164-option-a-image.png"),
    q164_b: await uploadFile("q164-option-b-image.png", "neet-ug-2025/structured/q164-option-b-image.png"),
    q164_c: await uploadFile("q164-option-c-image.png", "neet-ug-2025/structured/q164-option-c-image.png"),
    q164_d: await uploadFile("q164-option-d-image.png", "neet-ug-2025/structured/q164-option-d-image.png"),
  };

  // Perform database updates
  const updates = [
    {
      num: 15,
      data: {
        option_a: "$D_1$ and $D_2$ both are forward biased",
        option_b: "$D_1$ and $D_2$ both are reverse biased",
        option_c: "$D_1$ is forward biased, $D_2$ is reverse biased",
        option_d: "$D_1$ is reverse biased, $D_2$ is forward biased"
      }
    },
    {
      num: 41,
      data: {
        question_image: uploads.q041_q
      }
    },
    {
      num: 45,
      data: {
        question_image: uploads.q045_q
      }
    },
    {
      num: 58,
      data: {
        option_a: "$\\mathrm{H-C\\equiv C-H \\xrightarrow[873\\text{ K}]{\\text{red hot Fe tube}} \\text{Benzene}}$",
        option_b: "$\\mathrm{C_6H_5N_2^+Cl^- \\xrightarrow{\\text{H}_2\\text{O / warm}} \\text{Phenol}}$",
        option_c: "$\\mathrm{C_6H_5COONa \\xrightarrow{\\text{Sodalime / }\\Delta} \\text{Benzene}}$",
        option_d: "$\\mathrm{n\\text{-hexane} \\xrightarrow[773\\text{ K, 10--20 atm}]{\\mathrm{Mo_2O_3}} \\text{Benzene}}$",
        option_a_image: null,
        option_b_image: null,
        option_c_image: null,
        option_d_image: null
      }
    },
    {
      num: 64,
      data: {
        option_a_image: uploads.q064_a,
        option_b_image: uploads.q064_b,
        option_c_image: uploads.q064_c,
        option_d_image: uploads.q064_d
      }
    },
    {
      num: 81,
      data: {
        option_a_image: uploads.q081_a,
        option_b_image: uploads.q081_b,
        option_c_image: uploads.q081_c,
        option_d_image: uploads.q081_d
      }
    },
    {
      num: 82,
      data: {
        question_image: uploads.q082_q,
        option_a_image: uploads.q082_a,
        option_b_image: uploads.q082_b,
        option_c_image: uploads.q082_c,
        option_d_image: uploads.q082_d
      }
    },
    {
      num: 90,
      data: {
        question_image: uploads.q090_q,
        option_a_image: uploads.q090_a,
        option_b_image: uploads.q090_b,
        option_c_image: uploads.q090_c,
        option_d_image: uploads.q090_d
      }
    },
    {
      num: 152,
      data: {
        question: "Given two statements:\n**Statement I:** The floral-formula symbol $\\%$ denotes a zygomorphic flower, and $\\overline{\\mathrm{G}}$ denotes an inferior ovary.\n**Statement II:** The floral-formula symbol $\\oplus$ denotes an actinomorphic flower, and $\\underline{\\mathrm{G}}$ denotes a superior ovary.\n\nChoose the correct answer from the options given below:"
      }
    },
    {
      num: 164,
      data: {
        option_a_image: uploads.q164_a,
        option_b_image: uploads.q164_b,
        option_c_image: uploads.q164_c,
        option_d_image: uploads.q164_d
      }
    },
    {
      num: 172,
      data: {
        question: "Name the class of enzyme that usually catalyzes the following reaction:\n$$\\mathrm{S - G + S' \\to S + S' - G}$$\nWhere $\\mathrm{G} \\to$ a group other than hydrogen, $\\mathrm{S} \\to$ a substrate, and $\\mathrm{S'} \\to$ another substrate:"
      }
    }
  ];

  for (const item of updates) {
    const { data, error } = await supabase
      .from("pyq_questions")
      .update(item.data)
      .eq("exam_id", examId)
      .eq("question_number", item.num);

    if (error) {
      console.error(`Error updating Q${item.num}:`, error);
    } else {
      console.log(`Successfully updated Q${item.num} in DB.`);
    }
  }

  console.log("\nAll NEET 2025 updates completed successfully!");
}

run().catch(console.error);
