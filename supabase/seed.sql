-- ============================================================================
-- AgriSage AI - Comprehensive Indian Crop Catalog Seed Data
-- ============================================================================

INSERT INTO public.crops (
  name, scientific_name, category, description,
  suitable_soils, suitable_seasons, cultivation_duration_days,
  water_requirements, climate_requirements, cultivation_guide, source_references, is_published
) VALUES
-- CEREALS
(
  'Rice (Paddy)', 'Oryza sativa', 'cereal',
  'Primary staple food crop in India, cultivated extensively across river basins, coastal plains, and irrigated deltas.',
  '["clay", "clay_loam", "silty"]'::jsonb,
  '["kharif", "rabi"]'::jsonb,
  125,
  'High (1100-1250 mm). Requires standing water of 2-5 cm during vegetative and reproductive stages.',
  'Warm and humid climate with optimum temperature 22-32°C. Sensitive to cold snaps below 15°C.',
  '{
    "land_preparation": "Plough 2-3 times, puddle thoroughly with standing water to create an impervious subsoil layer, and level properly.",
    "sowing": "Nursery sowing with treated seeds (carbendazim 2g/kg). Transplant 21-25 day old seedlings at 20x15 cm spacing, 2 seedlings per hill.",
    "nutrient_management": "Apply 100-120 kg N, 50-60 kg P2O5, and 40-50 kg K2O per hectare. Apply all P and half K as basal; N in 3 equal splits (basal, tillering, panicle initiation).",
    "irrigation": "Maintain 2-3 cm water layer after transplanting until panicle emergence. Drain water 7-10 days before harvest.",
    "pest_and_disease": "Watch for stem borer, brown planthopper, and blast disease. Practice IPM and avoid excess nitrogen.",
    "harvesting": "Harvest when 80-85% grains in panicles turn golden brown and grain moisture is around 20-22%."
  }'::jsonb,
  '["ICAR - Indian Institute of Rice Research (IIRR)", "Directorate of Rice Development"]'::jsonb,
  true
),
(
  'Wheat', 'Triticum aestivum', 'cereal',
  'Premier Rabi cereal crop of North and Central India, providing high energy and protein.',
  '["loamy", "clay_loam", "sandy_loam"]'::jsonb,
  '["rabi"]'::jsonb,
  120,
  'Moderate (400-500 mm). Critical stages: Crown Root Initiation (CRI at 21 days), tillering, flowering, and grain filling.',
  'Cool growing season (15-20°C) with warm dry weather during grain ripening (25-30°C). Sensitive to heat stress at maturity.',
  '{
    "land_preparation": "Prepare fine and friable seedbed free of clods through deep ploughing followed by 2-3 harrowings and planking.",
    "sowing": "Sow in lines using seed drill at 20-22.5 cm row spacing, 4-5 cm depth. Optimum sowing window: first fortnight of November.",
    "nutrient_management": "Recommended NPK: 120:60:40 kg/ha. Apply half N and full P & K as basal; remaining N at first irrigation (CRI stage).",
    "irrigation": "4-6 irrigations depending on soil and rainfall. CRI stage (20-25 DAS) irrigation is indispensable for root development.",
    "pest_and_disease": "Monitor for yellow rust, brown rust, and loose smut. Treat seeds with vitavax or tebuconazole prior to sowing.",
    "harvesting": "Harvest when straw turns yellow and grains feel hard, with grain moisture below 14%."
  }'::jsonb,
  '["ICAR - Indian Institute of Wheat and Barley Research (IIWBR)"]'::jsonb,
  true
),
(
  'Maize (Corn)', 'Zea mays', 'cereal',
  'Versatile miracle cereal used for human food, poultry feed, fodder, and industrial starch.',
  '["loamy", "sandy_loam", "red_soil", "black_soil"]'::jsonb,
  '["kharif", "rabi", "zaid"]'::jsonb,
  105,
  'Moderate (500-600 mm). High sensitivity to waterlogging and severe drought at tasseling/silking.',
  'Grows well in temperatures between 21-27°C. Prefers sunny days and cannot tolerate frost or water stagnation.',
  '{
    "land_preparation": "Deep ploughing followed by 2 harrowings. Prepare ridges and furrows at 60 cm spacing for good drainage.",
    "sowing": "Sow on the sides of ridges at 60x20 cm spacing, 3-4 cm depth with 20 kg/ha seed rate.",
    "nutrient_management": "NPK 120:60:40 kg/ha with 25 kg/ha ZnSO4. Split N into 3 doses: 25% basal, 50% knee-high, 25% tasseling.",
    "irrigation": "Critical stages are knee-high, tasseling, silking, and grain formation. Never allow standing water.",
    "pest_and_disease": "Monitor closely for Fall Armyworm (Spodoptera frugiperda). Install pheromone traps and spray Bacillus thuringiensis or neem oil.",
    "harvesting": "Harvest when outer cob husks turn dry, silky tassels turn brown, and black layer forms at the grain base."
  }'::jsonb,
  '["ICAR - Indian Institute of Maize Research (IIMR)"]'::jsonb,
  true
),
(
  'Finger Millet (Ragi)', 'Eleusine coracana', 'cereal',
  'Nutri-cereal highly resilient to drought, extremely rich in calcium, dietary fiber, and iron. Dominant in Karnataka and Southern India.',
  '["red_soil", "sandy_loam", "laterite", "loamy"]'::jsonb,
  '["kharif", "rabi"]'::jsonb,
  110,
  'Low to moderate (350-450 mm). Tolerates drought spells effectively once established.',
  'Tropical warm climate, day temperature 25-32°C. Excellent performance in dryland rainfed ecosystems.',
  '{
    "land_preparation": "Plough 2-3 times to bring soil to fine tilth. Incorporate 10 tonnes/ha well-decomposed FYM.",
    "sowing": "Direct drilling or transplanting 20-25 day seedlings at 25x10 cm. Seed rate 8-10 kg/ha for direct seed, 5 kg/ha for transplanting.",
    "nutrient_management": "Recommended NPK: 50-60:30-40:25-30 kg/ha. Apply 50% N and full P & K as basal; top dress remaining N at 30 DAS.",
    "irrigation": "Irrigate at tillering, flowering, and grain filling if rains fail. Withstand dry spells better than most cereals.",
    "pest_and_disease": "Watch for blast disease (Pyricularia grisea) and shoot fly. Use certified blast-resistant cultivars.",
    "harvesting": "Harvest earheads with sickles when grains turn dark brown. Sun dry on threshing floor."
  }'::jsonb,
  '["ICAR - All India Coordinated Research Project on Pearl Millet & Small Millets", "UAS Bangalore"]'::jsonb,
  true
),

-- PULSES
(
  'Chickpea (Bengal Gram / Chana)', 'Cicer arietinum', 'pulse',
  'Premier pulse of India, rich in protein, restores soil fertility via biological nitrogen fixation.',
  '["black_soil", "clay_loam", "loamy"]'::jsonb,
  '["rabi"]'::jsonb,
  105,
  'Low to moderate (250-350 mm). Deep taproot extracts moisture from subsoil layers.',
  'Cool climate during vegetative growth, warm dry weather at maturity (15-25°C). Sensitive to frost and untimely winter rains.',
  '{
    "land_preparation": "Requires rough seedbed rather than very fine tilth to preserve subsoil moisture and avoid aeration issues.",
    "sowing": "Sow behind plough or with seed-cum-fertilizer drill at 30x10 cm spacing, 8-10 cm deep into moist zone. Treat with Rhizobium.",
    "nutrient_management": "Apply 20-25 kg N, 50-60 kg P2O5, and 20 kg S/ha as basal. Chickpea fixes most of its required nitrogen.",
    "irrigation": "Usually grown rainfed on residual moisture. One branching irrigation and one pod development irrigation enhance yield significantly.",
    "pest_and_disease": "Pod borer (Helicoverpa armigera) and Fusarium wilt are major threats. Intercrop with coriander or marigold as trap crop.",
    "harvesting": "Harvest when leaves turn reddish-yellow and fall off, pods turn yellowish brown."
  }'::jsonb,
  '["ICAR - Indian Institute of Pulses Research (IIPR)"]'::jsonb,
  true
),
(
  'Pigeon Pea (Tur / Arhar)', 'Cajanus cajan', 'pulse',
  'Vital pulse crop providing protein for dal, deep taproot breaks hardpans and adds rich organic matter.',
  '["black_soil", "red_soil", "loamy", "clay_loam"]'::jsonb,
  '["kharif"]'::jsonb,
  160,
  'Moderate (500-650 mm). Tolerates deep dry spells but sensitive to waterlogging.',
  'Warm tropical and subtropical climate (20-30°C). Thrives in bright sunny days.',
  '{
    "land_preparation": "Deep subsoiling every 2-3 years, 2 harrowings. Ensure free drainage to prevent Phytophthora stem blight.",
    "sowing": "Sow in June-July with onset of monsoon. Spacing: 90x20 cm for medium varieties, 120-150 cm for broad bed furrow intercropping.",
    "nutrient_management": "Basal application of 20 kg N, 50 kg P2O5, 20 kg K2O, and 20 kg Sulphur per hectare.",
    "irrigation": "Provide supplemental irrigation during flower initiation and pod filling if dry spell occurs.",
    "pest_and_disease": "Monitor pod borer and sterility mosaic disease. Use pheromone traps and resistant cultivars.",
    "harvesting": "Harvest when 75-80% pods dry out and produce rattling sound when shaken."
  }'::jsonb,
  '["ICAR - Indian Institute of Pulses Research (IIPR)", "ICRISAT"]'::jsonb,
  true
),

-- OILSEEDS
(
  'Groundnut (Peanut)', 'Arachis hypogaea', 'oilseed',
  'High-value edible oil and protein food crop, thrives in light well-drained sandy loams.',
  '["sandy_loam", "red_soil", "loamy"]'::jsonb,
  '["kharif", "rabi", "zaid"]'::jsonb,
  115,
  'Moderate (450-550 mm). Critical stages: flowering, peg penetration, and pod development.',
  'Warm sunny climate with 24-30°C optimum temperature. Free-draining loose topsoil is essential for peg entry.',
  '{
    "land_preparation": "Plough to depth of 15-20 cm and bring soil to loose friable tilth to facilitate effortless peg penetration.",
    "sowing": "Treat pods/kernels with Trichoderma (4g/kg) and Rhizobium. Spacing: 30x10 cm, sowing depth 4-5 cm.",
    "nutrient_management": "Apply 25 kg N, 50 kg P2O5, 40 kg K2O, and 200-400 kg Gypsum/ha at flowering/pegging for calcium supply.",
    "irrigation": "Irrigate at pegging and pod development. Stop irrigation 7-10 days before harvest to facilitate lifting.",
    "pest_and_disease": "Tikka leaf spot and collar rot. Ensure gypsum application and seed treatment with biocontrol agents.",
    "harvesting": "Harvest when inner shell wall turns dark brown/blackish and leaves turn yellowish."
  }'::jsonb,
  '["ICAR - Directorate of Groundnut Research (DGR)"]'::jsonb,
  true
),
(
  'Soybean', 'Glycine max', 'oilseed',
  'Dual-purpose wonder crop containing 40% protein and 20% oil, dominant in Madhya Pradesh and Maharashtra.',
  '["black_soil", "clay_loam", "loamy"]'::jsonb,
  '["kharif"]'::jsonb,
  95,
  'Moderate (500-600 mm). High sensitivity to water stagnation during initial seedling emergence.',
  'Warm and moist climate, optimum temperature 25-30°C. Photoperiod sensitive.',
  '{
    "land_preparation": "Two harrowings followed by planking. Broad Bed and Furrow (BBF) method is highly recommended for drainage.",
    "sowing": "Sow at 45x5 cm spacing, depth 3-4 cm. Inoculate seed with Bradyrhizobium japonicum and PSB.",
    "nutrient_management": "Basal dose: 25-30 kg N, 60 kg P2O5, 40 kg K2O, and 20 kg Sulphur per hectare.",
    "irrigation": "Generally rainfed. Critical moisture-sensitive stages: flowering and pod development.",
    "pest_and_disease": "Girdle beetle and stem fly. Yellow mosaic virus transmitted by whitefly. Apply IPM and neem sprays.",
    "harvesting": "Harvest when leaves turn yellow and drop off, and pods turn golden brown."
  }'::jsonb,
  '["ICAR - Indian Institute of Soybean Research (IISR)"]'::jsonb,
  true
),

-- VEGETABLES
(
  'Tomato', 'Solanum lycopersicum', 'vegetable',
  'High-value solanaceous vegetable consumed fresh and processed, widely cultivated year-round in Karnataka and Maharashtra.',
  '["loamy", "red_soil", "sandy_loam", "clay_loam"]'::jsonb,
  '["kharif", "rabi", "zaid"]'::jsonb,
  110,
  'Moderate (400-600 mm). Frequent light irrigations via drip system yield highest grade fruit.',
  'Warm and moderate climate (18-28°C). Fruit set fails above 35°C or below 12°C. High humidity favors blights.',
  '{
    "land_preparation": "Deep ploughing, incorporate 25 t/ha FYM, prepare raised beds of 90 cm width with 30 cm furrows.",
    "sowing": "Raise nursery under shade net or pro-trays. Transplant 25-30 day seedlings at 60x45 cm or 75x45 cm spacing.",
    "nutrient_management": "Apply 150 kg N, 100 kg P2O5, 120 kg K2O per hectare through fertigation schedule in 10-15 splits.",
    "irrigation": "Drip irrigation at 2-3 day intervals. Maintain even soil moisture to prevent blossom end rot and fruit cracking.",
    "pest_and_disease": "Tomato leaf curl virus (whitefly vector), bacterial wilt, early/late blight, and fruit borer. Stake plants properly.",
    "harvesting": "Harvest at breaker/turning stage for distant transport, and pink/red-ripe stage for local markets."
  }'::jsonb,
  '["ICAR - Indian Institute of Horticultural Research (IIHR), Bengaluru"]'::jsonb,
  true
),
(
  'Onion', 'Allium cepa', 'vegetable',
  'Commercial bulb vegetable essential to Indian culinary culture, sensitive to daylength and storage conditions.',
  '["sandy_loam", "loamy", "clay_loam", "red_soil"]'::jsonb,
  '["kharif", "rabi"]'::jsonb,
  125,
  'Moderate (350-450 mm). Shallow root system demands consistent soil moisture; avoid water stress during bulb enlargement.',
  'Cool climate during early vegetative growth (15-20°C) and dry warm climate for bulb maturation and curing (25-32°C).',
  '{
    "land_preparation": "Plough to 15 cm depth, incorporate well-rotted FYM, and lay broad beds (120 cm wide) or flat beds.",
    "sowing": "Transplant 6-7 week old seedlings at 15x10 cm spacing. Ensure seedlings are healthy and not over-aged.",
    "nutrient_management": "Apply 100 kg N, 50 kg P2O5, 50 kg K2O, and 30 kg Sulphur/ha. Sulphur is critical for pungency and storage quality.",
    "irrigation": "Irrigate immediately after transplanting, followed by light irrigations every 7-10 days. Stop irrigation 15 days before harvest.",
    "pest_and_disease": "Onion thrips (Thrips tabaci) and purple blotch (Alternaria porri). Use blue sticky traps and mancozeb if needed.",
    "harvesting": "Harvest when 50% of tops have fallen over (neck fall). Cure bulbs in field for 3 days and in shade for 10-15 days."
  }'::jsonb,
  '["ICAR - Directorate of Onion and Garlic Research (DOGR), Pune"]'::jsonb,
  true
),
(
  'Chilli (Hot Pepper)', 'Capsicum annuum', 'vegetable',
  'Pungent spice and vegetable crop cultivated extensively in Andhra Pradesh, Karnataka, and Telangana.',
  '["black_soil", "red_soil", "loamy", "sandy_loam"]'::jsonb,
  '["kharif", "rabi"]'::jsonb,
  135,
  'Moderate (500-600 mm). Extremely sensitive to waterlogging; excess water induces flower dropping.',
  'Warm humid climate with 20-30°C temperature. Frost intolerant.',
  '{
    "land_preparation": "Plough 3-4 times, add 20 t/ha farmyard manure. Create ridges and furrows or raised beds with drip.",
    "sowing": "Transplant 35-40 day seedlings at 60x45 cm or 75x45 cm. Treat seedlings with Pseudomonas fluorescens suspension.",
    "nutrient_management": "Apply 120 kg N, 60 kg P2O5, 80 kg K2O/ha. Apply P as basal; split N and K in 4 installments.",
    "irrigation": "Irrigate at flowering and fruit set. Avoid moisture stress or excessive saturation.",
    "pest_and_disease": "Chilli thrips, yellow mites, fruit borer, and anthracnose/die-back. Spray wettable sulphur for mites.",
    "harvesting": "Pick green chillies at 10-15 day intervals for fresh market, or red ripe fruits for drying."
  }'::jsonb,
  '["ICAR - Indian Institute of Horticultural Research (IIHR)"]'::jsonb,
  true
),

-- FRUITS
(
  'Mango', 'Mangifera indica', 'fruit',
  'The King of Fruits in India. Alphonso, Kesar, Dasheri, Banganapalli, and Totapuri are celebrated cultivars.',
  '["red_soil", "loamy", "laterite", "clay_loam"]'::jsonb,
  '["year_round"]'::jsonb,
  365,
  'Moderate to high in early years (750-1000 mm). Mature orchards benefit from dry spell before flowering.',
  'Tropical and subtropical climate. Requires warm frost-free climate with distinct dry period to stimulate flowering.',
  '{
    "land_preparation": "Dig pits of 1x1x1 meter size at 8x8 m or 10x10 m spacing (or 5x5 m for ultra high density). Fill with FYM and topsoil.",
    "sowing": "Plant certified epicotyl or veneer grafted saplings during monsoon (July-August). Stake immediately.",
    "nutrient_management": "For bearing trees: 1000g N, 500g P2O5, 1000g K2O per tree per year along with 50 kg well-decomposed manure.",
    "irrigation": "Withhold irrigation 2 months before flowering to induce flower bud differentiation. Resume irrigation after fruit set.",
    "pest_and_disease": "Mango hopper, fruit fly, and powdery mildew. Hang fruit fly methyl eugenol traps in orchard.",
    "harvesting": "Harvest with 1-2 cm pedicel attached using mechanical harvesters when shoulder development is complete and tapka occurs."
  }'::jsonb,
  '["ICAR - Central Institute for Subtropical Horticulture (CISH), Lucknow"]'::jsonb,
  true
),
(
  'Banana', 'Musa acuminata', 'fruit',
  'Fast-growing, high-return perennial fruit yielding heavy biomass and rich potassium nutrition.',
  '["clay_loam", "loamy", "red_soil", "black_soil"]'::jsonb,
  '["year_round"]'::jsonb,
  330,
  'High (1200-1800 mm). Demands uniform soil moisture throughout vegetative and bunch development.',
  'Tropical humid climate, 20-35°C temperature. Wind breaks are vital to protect against pseudostem lodging.',
  '{
    "land_preparation": "Deep ploughing followed by rotavator. Dig pits of 45x45x45 cm at 1.8x1.8 m spacing for tissue culture Grand Naine.",
    "sowing": "Plant virus-indexed tissue-culture plantlets or sword suckers (1-1.5 kg). Dip in carbendazim (2g/L) before planting.",
    "nutrient_management": "Apply 200g N, 60g P2O5, and 300g K2O per plant per crop cycle in 4 splits or through weekly fertigation.",
    "irrigation": "Drip irrigation is standard (15-20 liters/plant/day in summer). Mulch with dry leaves to conserve moisture.",
    "pest_and_disease": "Panama wilt (Fusarium oxysporum), Sigatoka leaf spot, pseudostem weevil, and nematode galling.",
    "harvesting": "Harvest bunch 90-110 days after flowering when angles of fruits become round and plump."
  }'::jsonb,
  '["ICAR - National Research Centre for Banana (NRCB), Tiruchirappalli"]'::jsonb,
  true
),

-- COMMERCIAL & PLANTATION CROPS
(
  'Cotton', 'Gossypium hirsutum', 'commercial',
  'The White Gold of Indian agriculture, providing livelihoods to millions of farmers and textile workers.',
  '["black_soil", "clay_loam", "clay"]'::jsonb,
  '["kharif"]'::jsonb,
  165,
  'Moderate to high (600-800 mm). Deep moisture retention of black cotton soils enables rainfed production.',
  'Warm climate with 21-30°C temperature. At least 180-200 frost-free days with abundant sunshine during boll opening.',
  '{
    "land_preparation": "Deep ploughing in summer to eradicate weeds and insect pupae. Prepare ridges and furrows at 90-120 cm spacing.",
    "sowing": "Sow Bt hybrid seeds at 90x60 cm or 120x45 cm spacing, depth 3-4 cm. Plant pigeonpea refuge rows as directed.",
    "nutrient_management": "Apply 120-150 kg N, 60 kg P2O5, 60 kg K2O/ha. Split N into 3-4 applications coinciding with square and boll formation.",
    "irrigation": "Critical stages: squaring, flowering, and boll development. Stop irrigation when 30-40% bolls burst.",
    "pest_and_disease": "Pink bollworm, sucking pests (aphids, jassids, thrips), and bacterial blight. Employ pheromone traps and light traps.",
    "harvesting": "Pick clean open bolls in dry morning hours after dew evaporates. Store in clean dry godowns."
  }'::jsonb,
  '["ICAR - Central Institute for Cotton Research (CICR), Nagpur"]'::jsonb,
  true
),
(
  'Sugarcane', 'Saccharum officinarum', 'commercial',
  'Major agro-industrial cash crop providing sugar, jaggery, ethanol biofuels, and bagasse cogeneration.',
  '["loamy", "clay_loam", "black_soil", "red_soil"]'::jsonb,
  '["year_round"]'::jsonb,
  360,
  'High (1500-2000 mm). Requires abundant water during grand growth phase.',
  'Tropical hot and sunny climate (28-35°C) during vegetative phase, with cool dry weather for sucrose accumulation.',
  '{
    "land_preparation": "Deep ploughing (30-40 cm) to break hard pan, followed by rotavator. Form furrows at 120-150 cm width.",
    "sowing": "Plant two-budded or single-budded setts (SSI method) at 75,000-80,000 buds/ha. Dip setts in carbendazim and imidacloprid.",
    "nutrient_management": "Apply 250-300 kg N, 100 kg P2O5, 120 kg K2O/ha. Complete nitrogen application before 90-120 days after planting.",
    "irrigation": "Irrigate at 8-10 day intervals in summer and 12-15 day intervals in winter. Furrow or drip irrigation.",
    "pest_and_disease": "Early shoot borer, internode borer, red rot (Colletotrichum falcatum), and smut. Use healthy certified seed setts.",
    "harvesting": "Harvest when Brix reading reaches 18-20% and top-bottom ratio is near 1.0. Cut flush to ground level."
  }'::jsonb,
  '["ICAR - Sugarcane Breeding Institute (SBI), Coimbatore"]'::jsonb,
  true
),
(
  'Coffee', 'Coffea arabica / Coffea canephora', 'plantation',
  'Premium shade-grown plantation crop of Western Ghats (Karnataka, Kerala, Tamil Nadu), prized for distinctive aroma.',
  '["laterite", "red_soil", "loamy"]'::jsonb,
  '["year_round"]'::jsonb,
  365,
  'High (1500-2500 mm). Requires blossom showers in March-April and backing showers in May.',
  'Subtropical/tropical cool humid elevation (800-1500m for Arabica, 500-1000m for Robusta) under two-tier shade trees.',
  '{
    "land_preparation": "Clear jungle underbrush, terrace steep slopes, plant shade trees (Silver Oak, Ficus, Erythrina) 2 years prior.",
    "sowing": "Dig pits 45x45x45 cm at 2x2 m spacing (Arabica) or 3x3 m (Robusta). Plant 18-month-old polybag seedlings in June-July.",
    "nutrient_management": "Apply 120-160 kg N, 90-120 kg P2O5, and 120-160 kg K2O per hectare in pre-monsoon and post-monsoon splits.",
    "irrigation": "Overhead sprinkler irrigation (blossom showers) in February-March if natural pre-monsoon rains fail.",
    "pest_and_disease": "Coffee berry borer (Hypothenemus hampei), white stem borer, and coffee leaf rust (Hemileia vastatrix).",
    "harvesting": "Selective hand-picking of bright red ripe cherries. Pulp and ferment for parchment coffee or dry for cherry coffee."
  }'::jsonb,
  '["Central Coffee Research Institute (CCRI), Coffee Board of India, Balehonnur, Chikmagalur"]'::jsonb,
  true
),

-- SPICES
(
  'Turmeric', 'Curcuma longa', 'spice',
  'Golden sacred spice rich in medicinal curcumin, cultivated widely in Andhra Pradesh, Tamil Nadu, and Karnataka.',
  '["loamy", "red_soil", "clay_loam", "sandy_loam"]'::jsonb,
  '["kharif"]'::jsonb,
  240,
  'Moderate to high (700-1000 mm). Requires moist soil conditions throughout rhizome development.',
  'Warm and humid climate, 20-35°C temperature. Thrives in partial shade as well as open fields.',
  '{
    "land_preparation": "Deep ploughing, incorporate 25-30 t/ha FYM. Make raised beds of 120 cm width with 40 cm irrigation channels.",
    "sowing": "Plant healthy mother or finger rhizomes (25-30g weight) at 30x20 cm spacing, 4 cm depth. Mulch with green leaves immediately.",
    "nutrient_management": "Apply 150 kg N, 60 kg P2O5, 100 kg K2O per hectare. Apply second and third mulching at 45 and 90 DAS with top dressing.",
    "irrigation": "Irrigate at 7-10 day intervals. Maintain continuous moisture but avoid stagnation to prevent rhizome rot.",
    "pest_and_disease": "Rhizome rot (Pythium aphanidermatum), leaf spot (Colletotrichum), and shoot borer. Ensure good field drainage.",
    "harvesting": "Harvest when leaves turn dry and yellow-brown. Dig carefully with spade, wash rhizomes, and cure by boiling."
  }'::jsonb,
  '["ICAR - Indian Institute of Spices Research (IISR), Kozhikode"]'::jsonb,
  true
),
(
  'Black Pepper', 'Piper nigrum', 'spice',
  'The King of Spices, a perennial woody climbing vine cultivated on shade standards in the rainforest belts of Karnataka and Kerala.',
  '["laterite", "red_soil", "clay_loam"]'::jsonb,
  '["year_round"]'::jsonb,
  365,
  'High (2000-3000 mm). High relative humidity with well-distributed rain is required.',
  'Humid tropical rainforest ecosystem with 10-35°C temperature and elevation up to 1200m.',
  '{
    "land_preparation": "Plant live standards like Arecanut, Silver Oak, or Erythrina at 3x3 m spacing. Dig planting pits on the north side.",
    "sowing": "Plant 2-3 rooted cuttings (Panniyur varieties) per standard during May-June. Tie runner shoots to the standard.",
    "nutrient_management": "Apply 100g N, 40g P2O5, and 140g K2O per mature vine per year in two equal splits (May-June and August-September).",
    "irrigation": "Protective irrigation via basin or drip during dry months of summer enhances berry retention.",
    "pest_and_disease": "Quick wilt / foot rot (Phytophthora capsici) and pollu beetle. Apply Trichoderma biofungicide and copper oxychloride.",
    "harvesting": "Harvest spikes when 1-2 berries on the spike turn bright orange or red. Thresh, blanch, and sun-dry on clean mats."
  }'::jsonb,
  '["ICAR - Indian Institute of Spices Research (IISR), Kozhikode"]'::jsonb,
  true
),
(
  'Cardamom (Small Cardamom)', 'Elettaria cardamomum', 'spice',
  'Queen of Spices, high-value aromatic spice indigenous to the evergreen forests of the Western Ghats.',
  '["laterite", "loamy", "red_soil"]'::jsonb,
  '["year_round"]'::jsonb,
  365,
  'High (1500-3500 mm). Requires high humidity and cool moist soil conditions year-round.',
  'Subtropical humid mountain elevations (600-1500m) with 10-30°C temperature under 50-60% shade canopy.',
  '{
    "land_preparation": "Clear unwanted undergrowth while preserving evergreen shade canopy. Dig pits of 60x60x45 cm at 2x2 m spacing.",
    "sowing": "Plant split suckers or polybag seedlings during June-July with onset of monsoon. Stake young plants.",
    "nutrient_management": "Apply 75 kg N, 75 kg P2O5, and 150 kg K2O per hectare in 2 splits with organic compost and neem cake.",
    "irrigation": "Irrigate at 10-12 day intervals during dry summer months with micro-sprinklers.",
    "pest_and_disease": "Azhukal (capsule rot), rhizome rot, and thrips (Sciothrips cardamomi). Regulate shade and practice phytosanitation.",
    "harvesting": "Pick capsules at 30-40 day intervals when seeds inside turn dark brown. Wash and cure in curing house."
  }'::jsonb,
  '["ICAR - Indian Institute of Spices Research (IISR)", "Spices Board of India"]'::jsonb,
  true
)
ON CONFLICT (name) DO NOTHING;
