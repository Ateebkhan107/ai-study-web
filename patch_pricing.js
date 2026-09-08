import fs from 'fs';
let code = fs.readFileSync('./src/app/pricing/page.jsx', 'utf8');

code = code.replace(
  'grid lg:grid-cols-3',
  'grid lg:grid-cols-4'
);

code = code.replace(
  'popular={true}',
  '' // remove popular from Quarterly to maybe give it to AI mode or just remove it
);

const aiModeCard = `
          <PricingCard
            title="AI Mode"
            price={2000}
            originalPrice={2000}
            discount={0}
            duration="month"
            plan="ai_mode"
            examTrack={examTrack}
            popular={true}
            features={[
              "Everything in Pro",
              "Full Zi AI companion",
              "Higher AI usage limits",
              "Voice interaction",
              "Visual explanations",
              "Personalized study memory",
              "Personalized study plans",
            ]}
          />
`;

code = code.replace(
  '        </div>\n\n        {/* Bottom Section */}',
  aiModeCard + '\n        </div>\n\n        {/* Bottom Section */}'
);

fs.writeFileSync('./src/app/pricing/page.jsx', code);
