/* ─────────────────────────────────────────────────────────
   NA Road Trip Data
   All stops, permits, and recommendations
───────────────────────────────────────────────────────── */

const STOPS = [
  { num:1,  name:'Home — Owings Mills, MD', sub:'Start of the epic journey', type:'city', miles:'676 mi → Acadia', hrs:'~11.5 hrs', canada:false },
  { num:2,  name:'Acadia National Park, ME', sub:'Precipice Trail · Cadillac Mountain sunrise · Sand Beach · Thunder Hole · Jordan Pond · Stewman\'s Lobster Pound', type:'np', miles:'217 mi → Mt. Washington', hrs:'~4.7 hrs', canada:false },
  { num:3,  name:'Mount Washington, NH', sub:'Summit (6,288 ft — highest in Northeast) · Auto road or hike · alpine zone', type:'climb', miles:'228 mi → Adirondacks', hrs:'~5.3 hrs', canada:false },
  { num:4,  name:'Saranac Lake / Adirondacks, NY', sub:'Kayaking · fire tower hike · 46 High Peaks region', type:'np', miles:'131 mi → Boldt Castle', hrs:'~2.75 hrs', canada:false },
  { num:5,  name:'Boldt Castle & Thousand Islands, NY', sub:'Castle tour · St. Lawrence River · 1,000 islands boat tour', type:'city', miles:'50 mi → Rochester', hrs:'~1 hr', canada:false },
  { num:6,  name:'Rochester, NY', sub:'Visit Sam, Carter, DiMartino · Strong National Museum of Play', type:'city', miles:'169 mi → Toronto', hrs:'~3.3 hrs', canada:false },
  { num:7,  name:'Toronto, Canada 🇨🇦', sub:'CN Tower · Kensington Market · Distillery District · Techstars connections', type:'city', miles:'450 mi → Chicago', hrs:'~8 hrs via Detroit', canada:true },
  { num:8,  name:'Chicago / Madison, IL/WI', sub:'Architecture river cruise · Millennium Park · visit Jan Lohs · Cousin Dick', type:'city', miles:'330 mi → Badlands', hrs:'~5.5 hrs', canada:false },
  { num:9,  name:'Badlands National Park, SD', sub:'Castle Trailhead · Prairie Homestead · Cedar Pass Lodge · Roberts Prairie Dog Town · Wall Drug · Wounded Knee Museum', type:'np', miles:'42 mi → Mt. Rushmore', hrs:'~1 hr', canada:false },
  { num:10, name:'Mount Rushmore National Memorial, SD', sub:'Sculptor\'s Studio · Presidential Trail loop at base', type:'np', miles:'18 mi → Crazy Horse', hrs:'~45 min', canada:false },
  { num:11, name:'Crazy Horse Mountain Memorial, SD', sub:'Largest mountain carving in the world — still ongoing', type:'np', miles:'43 mi → Dinosaur Park', hrs:'~1 hr', canada:false },
  { num:12, name:'Dinosaur Park & Deadwood, SD', sub:'Hillside dino replicas · Wild West historic district · Saloon 10', type:'city', miles:'120 mi → Devil\'s Tower', hrs:'~2.5 hrs', canada:false },
  { num:13, name:'Devil\'s Tower National Monument, WY', sub:'Sacred Lakota site · 867-ft monolith · wildlife loop trail', type:'np', miles:'229 mi → Theodore Roosevelt NP', hrs:'~4 hrs', canada:false },
  { num:14, name:'Theodore Roosevelt National Park, ND', sub:'Painted Canyon · bison herds · Petrified Forest Trail · badlands loop drive', type:'np', miles:'350 mi → Yellowstone', hrs:'~6 hrs', canada:false },
  { num:15, name:'Yellowstone National Park, WY', sub:'Grand Prismatic Spring · Old Faithful · Lamar Valley · Boiling River hot spring · Mammoth Hot Springs · Smith Mansion', type:'np', miles:'73 mi → Grand Teton', hrs:'~1.5 hrs', canada:false },
  { num:16, name:'Grand Teton National Park, WY', sub:'Mormon Row · TA Moulton Barn · Jenny Lake · Cascade Canyon · Jackson Lake · antler arches of Jackson', type:'np', miles:'120 mi → Flathead Lake', hrs:'~2.5 hrs', canada:false },
  { num:17, name:'Flathead Lake, MT', sub:'Largest natural freshwater lake west of Mississippi · kayaking', type:'city', miles:'72 mi → Glacier NP', hrs:'~1.3 hrs', canada:false },
  { num:18, name:'Glacier National Park, MT', sub:'Going-to-the-Sun Road · Grinnell Lake · Two Medicine · Waterton Lakes NP (Canada) · Ptarmigan Tunnel · Highline Trail · dark sky stargazing', type:'np', miles:'58 mi → Banff', hrs:'~1.3 hrs', canada:false },
  { num:19, name:'Banff National Park, Canada 🇨🇦', sub:'Moraine Lake · Lake Louise · Temple Mountain · Emerald Lake · Peyto Lake · Herbert Lake · Wapta Lake · town of Banff', type:'np', miles:'58 mi → Yoho NP', hrs:'~1.3 hrs', canada:true },
  { num:20, name:'Yoho National Park, Canada 🇨🇦', sub:'Takakkaw Falls · Emerald Lake · Natural Bridge · President\'s Group viewpoint', type:'np', miles:'450 mi → Vancouver', hrs:'~5 hrs via Rogers Pass', canada:true },
  { num:21, name:'Vancouver, BC 🇨🇦', sub:'Britannia Mine Museum · Garibaldi Provincial Park · Shannon Falls · Stanley Park · Granville Island Market', type:'city', miles:'124 mi → San Juan Island', hrs:'~4.5 hrs (ferry)', canada:true },
  { num:22, name:'San Juan Island, WA', sub:'Orca whale watching · Lime Kiln State Park · Friday Harbor · English Camp', type:'city', miles:'104 mi → Olympic NP', hrs:'~3 hrs', canada:false },
  { num:23, name:'Olympic National Park, WA', sub:'Hoh Rainforest · Hall of Mosses Trail · Ruby Beach · Cape Flattery · Shi Shi Beach · Hurricane Ridge · Sol Duc Falls', type:'np', miles:'89 mi → Seattle', hrs:'~2 hrs', canada:false },
  { num:24, name:'Seattle, WA', sub:'Pike Place Market · Space Needle · Museum of Pop Culture · Capitol Hill · Columbia River Gorge day trip', type:'city', miles:'89 mi → Mt. Rainier', hrs:'~2 hrs', canada:false },
  { num:25, name:'Mount Rainier National Park, WA', sub:'Paradise wildflowers · Wonderland Trailhead · Skyline Trail · Grove of the Patriarchs · Silver Falls Trail · Spray Park', type:'np', miles:'155 mi → North Cascades', hrs:'~3 hrs', canada:false },
  { num:26, name:'North Cascades National Park, WA', sub:'State Route 20 scenic drive · Diablo Lake · Washington Pass Overlook · Desolation Peak Trail', type:'np', miles:'180 mi → Mt. St. Helens', hrs:'~3.5 hrs', canada:false },
  { num:27, name:'Mount St. Helens, WA', sub:'Summit climb (permit required) · Johnston Ridge Observatory · Ape Cave lava tube', type:'climb', miles:'80 mi → Portland', hrs:'~1.5 hrs', canada:false },
  { num:28, name:'Portland, OR', sub:'Japanese Gardens · Powell\'s Books · food cart scene · Columbia River Gorge day trip · Multnomah Falls', type:'city', miles:'136 mi → Oregon Coast', hrs:'~3 hrs', canada:false },
  { num:29, name:'Oregon Coast — Haystack Rock & Thor\'s Well', sub:'Cannon Beach · Haystack Rock tide pools · Cape Perpetua · Thor\'s Well at high tide', type:'np', miles:'225 mi → Crater Lake', hrs:'~4.75 hrs', canada:false },
  { num:30, name:'Crater Lake National Park, OR', sub:'Rim Drive (33-mile loop) · Wizard Island boat tour · Garfield Peak Trail · Cleetwood Cove · deepest lake in the US', type:'np', miles:'90 mi → Lassen Volcanic', hrs:'~2 hrs', canada:false },
  { num:31, name:'Lassen Volcanic NP, CA ✦ Added', sub:'Bumpass Hell thermal fields · Lassen Peak summit · only park with all 4 volcano types in one place', type:'np', miles:'175 mi → Lake Tahoe', hrs:'~2.5 hrs', canada:false },
  { num:32, name:'Lake Tahoe, CA/NV', sub:'Emerald Bay · Vikingsholm Castle · Tahoe Rim Trail section · D.L. Bliss State Park', type:'city', miles:'163 mi → Mendocino', hrs:'~3 hrs', canada:false },
  { num:33, name:'Mendocino / Fort Bragg, CA', sub:'Glass Beach · Mendocino Headlands · Skunk Train through redwoods', type:'city', miles:'91 mi → San Francisco', hrs:'~2.5 hrs', canada:false },
  { num:34, name:'San Francisco Metro, CA', sub:'Visit Bradshaw & Akhil · Sonoma & Laguna Seca raceway · Apple Campus Cupertino · Palo Alto · Golden Gate · Muir Woods', type:'city', miles:'43 mi → Santa Cruz', hrs:'~1 hr', canada:false },
  { num:35, name:'Santa Cruz, CA', sub:'Beach Boardwalk · Natural Bridges State Park · redwood hiking', type:'city', miles:'43 mi → Monterey', hrs:'~45 min', canada:false },
  { num:36, name:'Monterey & Big Sur, CA', sub:'Monterey Bay Aquarium · 17-Mile Drive · Carmel-by-the-Sea · Big Sur scenic drive', type:'city', miles:'171 mi → Yosemite', hrs:'~4 hrs', canada:false },
  { num:37, name:'Yosemite National Park, CA', sub:'Half Dome (permit required) · Clouds Rest · Glacier Point · El Capitan · Mist Trail · Nevada Falls · Ansel Adams Gallery', type:'np', miles:'54 mi → Sequoia', hrs:'~1.75 hrs', canada:false },
  { num:38, name:'Sequoia National Park, CA', sub:'General Sherman Tree · Moro Rock · Crystal Cave · High Sierra Trail · Giant Forest Museum · Tokopah Falls', type:'np', miles:'225 mi → Kings Canyon', hrs:'~4.5 hrs', canada:false },
  { num:39, name:'Kings Canyon National Park, CA', sub:'Kings Canyon Scenic Byway · Roaring River Falls · Zumwalt Meadows · General Grant Grove', type:'np', miles:'183 mi → Death Valley', hrs:'~3.5 hrs', canada:false },
  { num:40, name:'Death Valley National Park, CA', sub:'Badwater Basin · Dante\'s View · Mesquite Flat Sand Dunes · Racetrack Playa sailing stones · Zabriskie Point · Artist\'s Drive · Eureka Dunes', type:'np', miles:'117 mi → Las Vegas', hrs:'~1.75 hrs', canada:false },
  { num:41, name:'Fly Geyser, NV', sub:'Private land — visit via tour. Book at flygeyser.org. Rainbow-colored geothermal geyser on Black Rock Desert', type:'np', miles:'3 hrs south → Burning Man', hrs:'seasonal', canada:false },
  { num:42, name:'Burning Man (Black Rock City, NV)', sub:'Attend Burning Man · tickets.burningman.org · late August / early September', type:'city', miles:'171 mi → Las Vegas', hrs:'~3.5 hrs', canada:false },
  { num:43, name:'Las Vegas, NV', sub:'Sphere event · Blackjack & poker · Red Rock Canyon NCA · Hoover Dam · Valley of Fire State Park (add!)', type:'city', miles:'203 mi → Havasu Falls', hrs:'~5 hrs', canada:false },
  { num:44, name:'Havasu Falls, AZ', sub:'Havasupai Reservation · 4 days / 3 nights required · turquoise waterfalls · PERMIT REQUIRED — havasupaireservations.com', type:'np', miles:'120 mi → Grand Canyon', hrs:'~2.5 hrs', canada:false },
  { num:45, name:'Grand Canyon National Park, AZ', sub:'South Kaibab Trail · Bright Angel Trail · Grandview Trail · Papillon helicopter tour · Desert View Watchtower · Yavapai Point', type:'np', miles:'179 mi → Sedona', hrs:'~3.3 hrs', canada:false },
  { num:46, name:'Sedona, AZ', sub:'Red Rock Crossing · Cathedral Rock · Devil\'s Bridge · Airport Mesa sunset vortex', type:'city', miles:'117 mi → Monument Valley', hrs:'~2.3 hrs', canada:false },
  { num:47, name:'Monument Valley, AZ', sub:'Navajo Nation Tribal Park · The Mittens · artist\'s viewpoint at sunrise', type:'np', miles:'50 mi → Four Corners', hrs:'~1 hr', canada:false },
  { num:48, name:'Four Corners Monument, AZ/UT/CO/NM', sub:'Only place in the US where 4 states meet · Navajo Nation site', type:'city', miles:'55 mi → Mesa Verde', hrs:'~1 hr', canada:false },
  { num:49, name:'Mesa Verde National Park, CO', sub:'Cliff Palace (guided tour permit required) · Balcony House · Long House · Ute Mountain Tribal Park', type:'np', miles:'80 mi → Antelope Canyon', hrs:'~1.5 hrs', canada:false },
  { num:50, name:'Antelope Canyon & Horseshoe Bend, AZ', sub:'Upper/Lower Antelope Canyon — Navajo guided tours only · Horseshoe Bend sunrise viewpoint', type:'np', miles:'95 mi → Zion', hrs:'~2 hrs', canada:false },
  { num:51, name:'Zion National Park, UT', sub:'Angels Landing (permit required) · The Narrows bottom-up (free) · Narrows top-down (permit req) · Subway (permit req) · Observation Point', type:'np', miles:'85 mi → Bryce Canyon', hrs:'~1.5 hrs', canada:false },
  { num:52, name:'Bryce Canyon National Park, UT', sub:'Sunset Point · Queens Garden Trail · Wall Street · Thor\'s Hammer · Scenic Byway 12 drive', type:'np', miles:'135 mi → Capitol Reef', hrs:'~2.5 hrs', canada:false },
  { num:53, name:'Capitol Reef National Park, UT', sub:'Scenic Drive · Waterpocket Fold · Hickman Bridge · Cathedral Valley · fruit orchards in season', type:'np', miles:'70 mi → Canyonlands', hrs:'~1.5 hrs', canada:false },
  { num:54, name:'Canyonlands National Park, UT', sub:'Mesa Arch · White Rim Road · Horseshoe Canyon petroglyphs · The Maze · Needles District · False Kiva', type:'np', miles:'49 mi → Arches', hrs:'~1.3 hrs', canada:false },
  { num:55, name:'Arches National Park, UT', sub:'Delicate Arch · Landscape Arch · Double Arch · Moab Hell\'s Revenge offroad · nearby Pony Expresso Coffee', type:'np', miles:'122 mi → Aspen', hrs:'~2.25 hrs', canada:false },
  { num:56, name:'Aspen / Maroon Bells, CO', sub:'Maroon Bells timed-entry (6–8am free) · 14er climbs nearby: Maroon Peak, Capitol Peak · Maroon Lake', type:'np', miles:'174 mi → Great Sand Dunes', hrs:'~3.5 hrs', canada:false },
  { num:57, name:'Great Sand Dunes National Park, CO', sub:'Tallest sand dunes in North America · UFO Watchtower nearby · sand boarding', type:'np', miles:'143 mi → Bishop Castle', hrs:'~3 hrs', canada:false },
  { num:58, name:'Bishop Castle, CO', sub:'Solo-built medieval castle · free to visit · genuinely wild roadside attraction', type:'city', miles:'87 mi → Royal Gorge', hrs:'~1.5 hrs', canada:false },
  { num:59, name:'Royal Gorge Bridge & Pikes Peak, CO', sub:'Highest suspension bridge · Pikes Peak Cog Railway or drive to summit · racing events', type:'city', miles:'26 mi → Garden of the Gods', hrs:'~45 min', canada:false },
  { num:60, name:'Garden of the Gods / Colorado Springs, CO', sub:'Free entry · surreal red rock formations · Balanced Rock · excellent visitor center', type:'np', miles:'177 mi → Denver', hrs:'~3.5 hrs', canada:false },
  { num:61, name:'Denver / Rocky Mountain NP, CO', sub:'Red Rocks concert · Vail / Breckenridge · Rocky Mountain NP (Alberta Falls, Longs Peak, Trail Ridge Road) · Boulder', type:'np', miles:'623 mi → Kansas City', hrs:'~9 hrs', canada:false },
  { num:62, name:'National WWI Museum, Kansas City, MO', sub:'One of the world\'s best WWI museums · Liberty Memorial · Union Station', type:'city', miles:'298 mi → Louisville', hrs:'~5 hrs', canada:false },
  { num:63, name:'Louisville, KY', sub:'Visit Barb · Louisville Slugger Museum · Kentucky bourbon trail · Churchill Downs', type:'city', miles:'107 mi → Tail of the Dragon', hrs:'~2.3 hrs', canada:false },
  { num:64, name:'Tail of the Dragon, NC', sub:'318 curves in 11 miles · Deals Gap · biker & driver mecca · Tree of Shame', type:'city', miles:'178 mi → Biltmore', hrs:'~3 hrs', canada:false },
  { num:65, name:'Biltmore Estate, NC', sub:'Largest private home in the US · 8,000 acres · winery · formal gardens', type:'city', miles:'247 mi → Greensboro', hrs:'~4 hrs', canada:false },
  { num:66, name:'Greensboro, NC', sub:'Visit Mitch · International Civil Rights Center & Museum', type:'city', miles:'199 mi → Colonial Williamsburg', hrs:'~3.5 hrs', canada:false },
  { num:67, name:'Colonial Williamsburg, VA', sub:'Living history museum · 18th-century trades · Jamestown & Yorktown nearby · Shenandoah NP on the way home', type:'city', miles:'247 mi → Home', hrs:'~4 hrs', canada:false },
  { num:68, name:'Home — Owings Mills, MD', sub:'Trip complete. What a run.', type:'city', miles:'—', hrs:'—', canada:false },
];

const PERMITS = [
  {
    name: 'Cadillac Mountain Sunrise — Acadia NP, ME',
    diff: 'moderate', diffLabel: 'Moderate competition',
    best: ['May', 'June', 'September', 'October'],
    website: 'recreation.gov/timed-entry/400000',
    how: 'Vehicle reservation required May 20 – Oct 25. Two types: Sunrise (90-min entry window before sunrise) and Daytime (30-min window). 30% of slots available 90 days out; 70% released 2 days prior at 10am ET.',
    cost: '$6/vehicle reservation fee + park entrance ($35/vehicle)',
    when: 'Book 90 days out for 30% of slots. Set a reminder for exactly 2 days before your target date at 10am ET for the 70%.',
    notes: 'Hiking or biking to summit = no reservation needed. Download your QR code before entering the park — cell service is unreliable. One sunrise reservation per vehicle per 7 days.'
  },
  {
    name: 'Angels Landing — Zion NP, UT',
    diff: 'hard', diffLabel: 'Very competitive',
    best: ['March–May', 'September–November'],
    website: 'recreation.gov/permits/4675310',
    how: 'Seasonal lottery (1–3 months prior) AND day-before lottery (opens 12:01am, closes 3pm MT daily). $6 non-refundable application fee. Up to 6 people per application. Pick up to 7 date preferences. Results by 4pm MT.',
    cost: '$6 application fee (non-refundable) + $3/person if permit is awarded',
    when: 'Seasonal: Spring lottery ~Jan 1; Summer ~April 1; Fall ~July 1. Day-before: Apply 12:01am–3pm MT the day before.',
    notes: 'Permit required at ALL times, year-round — no exceptions. No permit = $5,000 fine. Download before entering park — cell service very poor. Permit is for named holders only; ID required at checkpoint.'
  },
  {
    name: 'The Narrows Top-Down — Zion NP, UT',
    diff: 'moderate', diffLabel: 'Moderate',
    best: ['June', 'July', 'August', 'September'],
    website: 'recreation.gov (search: Zion Wilderness Permit)',
    how: 'Backcountry wilderness permit required for top-down from Chamberlain\'s Ranch (~16 miles). Advanced reservations on the 5th of each month at 10am MT, 2 months prior. Last-minute drawing available 7–2 days before.',
    cost: '$5 reservation fee + $15 (1-2 people) / $20 (3-7) / $25 (8-12) permit fee',
    when: 'Reserve on the 5th of the month, 2 months before your trip at exactly 10am MT.',
    notes: 'Bottom-up from Temple of Sinawava does NOT require a permit — only top-down. Check flow levels before hiking — swift currents can be dangerous. Wetsuit/drysuit recommended in spring.'
  },
  {
    name: 'The Subway (Left Fork) — Zion NP, UT',
    diff: 'hard', diffLabel: 'Very competitive',
    best: ['May', 'June', 'September', 'October'],
    website: 'recreation.gov (search: Zion Wilderness Permits)',
    how: 'Lottery system. Permit required for this technical canyoneering route. Advanced lottery or same-day walk-in at visitor center (limited). Rappelling and swimming required — this is a technical route.',
    cost: '$5 reservation + $15–25 permit fee based on group size',
    when: '2 months prior on the 5th at 10am MT for advance spots; walk-in at visitor center the day before.',
    notes: 'Requires technical gear: harness, rope, wetsuit or drysuit in spring. Not recommended without experience or a guide. Permits are very limited — typically only 80/day.'
  },
  {
    name: 'Half Dome — Yosemite NP, CA',
    diff: 'extreme', diffLabel: 'Extremely competitive (~22% success rate)',
    best: ['Weekdays in May', 'September', 'Early October'],
    website: 'recreation.gov/permits/234652',
    how: 'Pre-season lottery March 1–31 annually. Results announced mid-April. 225 permits/day for day hikers, 75 for backpackers. Daily lottery also available 2 days prior (midnight–4pm PT). Up to 6 people/application.',
    cost: '$10 application fee (non-refundable) + $10/person recreation fee if awarded',
    when: 'Pre-season: apply any day in March (no advantage to applying early or late). Daily: apply midnight–4pm PT exactly 2 days before you want to hike.',
    notes: 'Cables up from Friday before Memorial Day through Columbus Day. 17-mile roundtrip, 4,800 ft gain. Permit checkpoint at the sub-dome. No permit = $5,000 fine. Weekdays in September have the highest success rates — avoid Saturdays.'
  },
  {
    name: 'Havasu Falls — Havasupai Reservation, AZ',
    diff: 'extreme', diffLabel: 'Sells out in minutes',
    best: ['March–May', 'September–November'],
    website: 'havasupaireservations.com',
    how: '2026 system: Early Access window Jan 21–31 at 8am AZ time (guaranteed permit, +$40/person fee). Standard sale opens Feb 1 at 8am AZ time — first-come, first-served. All reservations are 4 days/3 nights. Up to 12 people/reservation.',
    cost: '$455/person campground (3 nights) + $40 early access fee. Lodge: $2,277/room + $160 early access.',
    when: 'Create your account at havasupaireservations.com NOW. Early Access: Jan 21 at 8am AZ. Standard: Feb 1 at 8am AZ — be ready before it opens.',
    notes: 'No day hiking allowed. No permit transfers. Cancellations 90+ days = 50% refund only. Check in at Grand Canyon Caverns Inn day-of or day-before. Bring a printed copy of your permit. Permit sold out for 2025 and 2026 in under 2 hours both years.'
  },
  {
    name: 'Mount St. Helens Summit Climb, WA',
    diff: 'moderate', diffLabel: 'Moderate — quota enforced',
    best: ['Late May', 'June', 'September'],
    website: 'recreation.gov/permits/4675309',
    how: 'Permits required year-round. April 1–May 14: 300 climbers/day. May 15–Nov 30: quota drops to 110/day. Dec 1–Mar 31: unlimited. Permits released on the 1st of each preceding month at 7am PT.',
    cost: '$15/person + $6 transaction fee per booking. Also need Northwest Forest Pass for parking ($30/year or $5/day).',
    when: 'On the 1st of the month prior (e.g., May permits available April 1 at 7am PT). Popular summer dates book out within hours.',
    notes: '17-mile roundtrip, non-technical but strenuous. Monitor Ridge route (summer) out of Climbers Bivouac. Maximum group size: 12. Print or download permit within 14 days of climb date.'
  },
  {
    name: 'Glacier NP — Going-to-the-Sun Road (2026)',
    diff: 'moderate', diffLabel: 'No vehicle reservation required in 2026',
    best: ['July', 'August'],
    website: 'nps.gov/glac · recreation.gov (campgrounds)',
    how: '2026 UPDATE: The vehicle reservation system for Going-to-the-Sun Road has been SUSPENDED. You still need a standard park entrance pass. Logan Pass parking is now limited to 3 hours. An express shuttle to Logan Pass will be ticketed — check nps.gov/glac for details.',
    cost: '$35/vehicle entrance pass (7-day) or America the Beautiful Pass ($80/year — covers all parks)',
    when: 'Campground reservations on recreation.gov open 6 months in advance. Book ASAP for July/August — Many Glacier fills months out.',
    notes: 'Road typically fully open mid-June through mid-October. Vehicles over 21 ft prohibited between Avalanche Creek and Rising Sun. July 4th week tends to be slightly less crowded than late July/August.'
  },
  {
    name: 'Mesa Verde Cliff Palace Tours — Mesa Verde NP, CO',
    diff: 'moderate', diffLabel: 'Reserve in advance',
    best: ['May', 'June', 'September'],
    website: 'recreation.gov',
    how: 'Cliff Palace and Balcony House require ranger-guided tours with reserved tickets. Self-guided access not permitted for these cliff dwellings. Tickets on recreation.gov. Tours operate May through October only.',
    cost: '$6/person per tour + $30/vehicle park entrance fee',
    when: 'Book up to 14 days in advance on recreation.gov. Popular tours (Cliff Palace 9–11am) sell out fast.',
    notes: 'Long House on Wetherill Mesa requires a separate ticket. Altitude at park is 7,000–8,500 ft — acclimatize first if coming from sea level. Bring water.'
  },
];

const RECS_HIGH = [
  {
    name: 'Peyto Lake, AB 🇨🇦',
    tag: 'Banff area',
    body: '15 minutes from Lake Louise. The wolf-shaped turquoise glacier lake viewed from Bow Summit is one of the most photographed spots in Canada. Arrive before 8am or after 5pm to beat tour buses. Covered by your Parks Canada Banff pass — free once you\'re in the park.'
  },
  {
    name: 'Columbia River Gorge, OR',
    tag: 'Near Portland',
    body: 'You pass right through it going Portland → Mt. St. Helens. Multnomah Falls (620 ft — second tallest in the US) requires a timed-entry permit via recreation.gov (~$2). Vista House on Crown Point is free and jaw-dropping. Adds 2 hours max to your Portland stop.'
  },
  {
    name: 'Valley of Fire State Park, NV',
    tag: 'Near Las Vegas',
    body: '40 minutes from Las Vegas on the way to Zion. Martian red sandstone formations, ancient petroglyphs, Wave formation. Far fewer crowds than anything in Utah. Best at sunrise or golden hour — literally glows. $10 entry per vehicle.'
  },
  {
    name: 'Waterton Lakes NP, Canada 🇨🇦',
    tag: 'Connected to Glacier NP',
    body: 'Already noted in your spreadsheet under Glacier — don\'t skip it. The International Peace Park hike crosses the US–Canada border on foot. The townsite is remarkably charming and far less crowded than Banff. Requires a Parks Canada pass (~$11 CAD/day).'
  },
  {
    name: 'Lassen Volcanic NP, CA',
    tag: 'Between Crater Lake & Tahoe',
    body: 'Added to the route already — but worth calling out. Almost exactly on your route between Crater Lake and Lake Tahoe. Active hydrothermal fields at Bumpass Hell, plus the only national park with all 4 types of volcano in one place. Far less visited than Rainier or Crater Lake. No day hiking permits needed.'
  },
];

const RECS_MED = [
  {
    name: 'Shenandoah NP, VA',
    tag: 'Final leg home',
    body: 'On your way home from Colonial Williamsburg → Maryland. Skyline Drive (105 miles) offers free-flowing scenic driving with zero traffic controls. Old Rag Mountain is the best day hike in the Mid-Atlantic and requires a timed-entry reservation (recreation.gov, Mar–Nov, ~$2). Fall foliage here in October is world-class.'
  },
  {
    name: 'Painted Hills, OR',
    tag: 'John Day Fossil Beds NM',
    body: '3 hours east of Portland but manageable if you adjust slightly between Crater Lake and the Oregon coast. Technicolor striped hills — red, gold, black, green — unlike anything else in the country. No permit needed. Free with America the Beautiful pass.'
  },
  {
    name: 'Apostle Islands Sea Caves, WI',
    tag: 'Near Madison/Chicago leg',
    body: 'Lake Superior sea caves accessible by kayak in summer. If you\'re passing through Madison, it\'s a 5-hour north detour that most people never make. Twelve miles of sandstone sea caves — some of the most dramatic kayaking in the country. Worth it if timing works.'
  },
  {
    name: 'Bonneville Salt Flats Speed Week, UT',
    tag: 'August timing',
    body: 'Already in your route — but if you time it for Speed Week (mid-August), you\'ll see land-speed record attempts on the 12-mile natural salt course. Combine with a spring visit when the flats are flooded for perfect mirror-lake reflection photos. Free to visit anytime.'
  },
];
