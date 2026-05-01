// ─── All 50 India Cities ───────────────────────────────────────────────────────
export const ALL_CITIES = [
  // ── Tier 1 Metros ──────────────────────────────────────────
  { slug: 'mumbai',       name: 'Mumbai',       state: 'Maharashtra',  region: 'West',    lat: 19.0760, lng: 72.8777, tier: 'tier1',   knownFor: ['financial capital', 'Bollywood', 'startup hub'],                   popularLocalities: ['Bandra', 'Andheri', 'Powai', 'Juhu', 'Thane', 'Worli', 'Malabar Hill'] },
  { slug: 'bangalore',    name: 'Bangalore',    state: 'Karnataka',    region: 'South',   lat: 12.9716, lng: 77.5946, tier: 'tier1',   knownFor: ['IT capital of India', 'startup ecosystem', 'pleasant climate'],           popularLocalities: ['Indiranagar', 'Koramangala', 'HSR', 'Whitefield', 'MG Road', 'JP Nagar', 'BTM Layout'] },
  { slug: 'hyderabad',    name: 'Hyderabad',     state: 'Telangana',     region: 'South',   lat: 17.3850, lng: 78.4867, tier: 'tier1',   knownFor: ['cyberabad IT hub', 'charminar heritage', 'pharmaceuticals'],         popularLocalities: ['Gachibowli', 'HITEC City', 'Banjara Hills', 'Jubilee Hills', 'Kukatpally', 'Secunderabad'] },
  { slug: 'chennai',      name: 'Chennai',      state: 'Tamil Nadu',    region: 'South',   lat: 13.0827, lng: 80.2707, tier: 'tier1',   knownFor: ['automobile manufacturing hub', 'healthcare', 'Tamil culture'],           popularLocalities: ['Anna Nagar', 'Adyar', 'T. Nagar', 'Velachery', 'OMR', 'Ecr', 'Mylapore'] },
  { slug: 'kolkata',      name: 'Kolkata',      state: 'West Bengal',   region: 'East',    lat: 22.5726, lng: 88.3639, tier: 'tier1',   knownFor: ['cultural capital of India', 'IT hub', 'historical heritage'],         popularLocalities: ['Salt Lake', 'Newtown', 'Ballygunge', 'Park Street', 'Alipore', 'Rajarhat', 'Behala'] },
  { slug: 'pune',         name: 'Pune',         state: 'Maharashtra',  region: 'West',    lat: 18.5204, lng: 73.8567, tier: 'tier1',   knownFor: ['IT & manufacturing hub', 'educational city', ' Pune culture'],           popularLocalities: ['Kothrud', 'Baner', 'Hinjewadi', 'Viman Nagar', 'Kharadi', 'Wakad', 'Aundh'] },

  // ── NCR & Satellites ─────────────────────────────────────
  { slug: 'delhi',        name: 'Delhi',        state: 'Delhi',        region: 'North',   lat: 28.6139, lng: 77.2090, tier: 'tier1',   knownFor: ['capital of India', 'political hub', 'Mughal heritage'],              popularLocalities: ['Dwarka', 'Rohini', 'Lajpat Nagar', 'Vasant Kunj', 'Saket', 'Pitampura', 'Mayur Vihar'] },
  { slug: 'gurugram',     name: 'Gurugram',     state: 'Haryana',      region: 'North',   lat: 28.4595, lng: 77.0266, tier: 'tier1',   knownFor: ['corporate hub', 'DLF townships', 'MNC offices'],                   popularLocalities: ['Golf Course Road', 'Sector 42', 'Sector 57', 'Sector 65', 'Dwarka Expressway', 'Sohna Road'] },
  { slug: 'gurgaon',      name: 'Gurgaon',      state: 'Haryana',      region: 'North',   lat: 28.4595, lng: 77.0266, tier: 'tier1',   knownFor: ['corporate hub', 'DLF townships', 'MNC offices'],                   popularLocalities: ['Golf Course Road', 'Cyber City', 'MG Road', 'Sohna Road', 'New Gurgaon', 'Dwarka Expressway'] },
  { slug: 'noida',        name: 'Noida',        state: 'UP',           region: 'North',   lat: 28.5355, lng: 77.3910, tier: 'tier1',   knownFor: ['IT parks', 'film city', 'metro connectivity'],                       popularLocalities: ['Sector 62', 'Sector 63', 'Sector 76', 'Sector 78', 'Sector 100', 'Sector 137', 'Film City'] },
  { slug: 'greater-noida',name: 'Greater Noida', state: 'UP',           region: 'North',   lat: 28.4744, lng: 77.5037, tier: 'tier1',   knownFor: ['planned city', 'educational institutions', 'Yamuna Expressway'],    popularLocalities: ['Alpha 1', 'Alpha 2', 'Beta 1', 'Omega 1', 'TechZone', 'Pari Chowk', 'Yamuna Expressway'] },
  { slug: 'faridabad',    name: 'Faridabad',    state: 'Haryana',      region: 'North',   lat: 28.4089, lng: 77.3178, tier: 'tier1',   knownFor: ['industrial city', 'Delhi metro connectivity', 'affordable housing'],   popularLocalities: ['Sector 12', 'Sector 14', 'Sector 15', 'Sector 21', 'Sector 35', 'Sector 37', 'Sector 70'] },
  { slug: 'ghaziabad',    name: 'Ghaziabad',    state: 'UP',           region: 'North',   lat: 28.6692, lng: 77.4538, tier: 'tier1',   knownFor: ['NCR suburb', 'affordable rentals', 'Indirapuram'],                  popularLocalities: ['Raj Nagar', 'Vaishali', 'Indirapuram', 'Crossing Republik', 'Vasundhara', 'Shahibabad'] },
  { slug: 'jaipur',       name: 'Jaipur',       state: 'Rajasthan',    region: 'North',   lat: 26.9124, lng: 75.7873, tier: 'tier1',   knownFor: ['Pink City', 'tourism hub', 'IT growth'],                             popularLocalities: ['Vaishali Nagar', 'Mansarovar', 'MI Road', 'C-Scheme', 'Jagatpur', 'Ajmer Road', 'Tonk Road'] },

  // ── Tier 1 Satellites ─────────────────────────────────────
  { slug: 'navi-mumbai', name: 'Navi Mumbai',   state: 'Maharashtra',  region: 'West',    lat: 19.0330, lng: 73.0297, tier: 'tier2',   knownFor: ['planned city', 'IT parks', 'Mumbai metro expansion'],            popularLocalities: ['Vashi', 'Sanpada', 'Kharghar', 'Panvel', 'Nerul', 'Airoli', 'CBD Belapur'] },
  { slug: 'thane',        name: 'Thane',        state: 'Maharashtra',  region: 'West',    lat: 19.2183, lng: 72.9785, tier: 'tier2',   knownFor: ['Mumbai suburb', 'affordable', 'Thane creek'],                       popularLocalities: ['Thane West', 'Kasarvadavali', 'Ghodbunder Road', 'Kolshet', 'Majiwada', 'Naupada'] },

  // ── Tier 2 IT/Industrial ──────────────────────────────────
  { slug: 'ahmedabad',   name: 'Ahmedabad',    state: 'Gujarat',      region: 'West',    lat: 23.0225, lng: 72.5714, tier: 'tier2',   knownFor: ['textile city', 'PM Narendra Modi\'s constituency', 'SEZ growth'],    popularLocalities: ['SG Highway', 'Satellite', 'Bodakdev', 'Vastrapur', 'Prahlad Nagar', 'Thaltej', 'Navrangpura'] },
  { slug: 'chandigarh',   name: 'Chandigarh',   state: 'Chandigarh',   region: 'North',   lat: 30.7333, lng: 76.7794, tier: 'tier2',   knownFor: ['planned city', 'IT hub', 'Union Territory'],                      popularLocalities: ['Sector 17', 'Sector 22', 'Sector 35', 'Mohali', 'Panchkula', 'IT Park', 'Madhya Marg'] },
  { slug: 'lucknow',      name: 'Lucknow',      state: 'UP',           region: 'North',   lat: 26.8467, lng: 80.9462, tier: 'tier2',   knownFor: ['capital of UP', ' Nawabi culture', 'IT parks emerging'],             popularLocalities: ['Gomti Nagar', 'Hazratganj', 'Indiranagar', 'Alambagh', 'Mahanagar', 'Kaiserbagh', 'Jopling Road'] },
  { slug: 'kochi',        name: 'Kochi',        state: 'Kerala',       region: 'South',   lat: 9.9312,  lng: 76.2673, tier: 'tier2',   knownFor: ['port city', 'IT hub Kerala', 'backwaters'],                          popularLocalities: ['Kakkanad', 'Palarivattom', 'Edapally', 'Vyttila', 'Kadavanthra', 'Marine Drive', 'Fort Kochi'] },
  { slug: 'indore',       name: 'Indore',       state: 'MP',           region: 'Central', lat: 22.7196, lng: 75.8577, tier: 'tier2',   knownFor: ['commercial capital of MP', 'educational hub', 'cleanest city'],      popularLocalities: ['Vijay Nagar', 'AB Road', 'MR 10', 'Rajendra Nagar', 'Manorama Ganj', 'Palasia', 'Old Palasia'] },
  { slug: 'bhopal',       name: 'Bhopal',       state: 'MP',           region: 'Central', lat: 23.2599, lng: 77.4126, tier: 'tier2',   knownFor: ['capital of MP', ' lakes city', 'industrial growth'],                 popularLocalities: ['MP Nagar', 'Arera Colony', 'Kolar Road', 'Habib Ganj', 'BHEL', 'Chuna Bhatti', 'Bairagarh'] },
  { slug: 'surat',        name: 'Surat',        state: 'Gujarat',      region: 'West',    lat: 21.1702, lng: 72.8311, tier: 'tier2',   knownFor: ['diamond hub', 'textile city', 'fastest growing city'],              popularLocalities: ['Athwa', 'Adajan', 'Piplod', 'Umra', 'Vesu', 'Dumas', 'City Light'] },
  { slug: 'vadodara',     name: 'Vadodara',     state: 'Gujarat',      region: 'West',    lat: 22.3072, lng: 73.1812, tier: 'tier2',   knownFor: ['industrial city', 'education hub', 'MS University'],                   popularLocalities: ['Alkapuri', 'Fatehgunj', 'Sayajigunj', 'Gotri', 'Akota', 'Pratapnagar', 'Karelibaug'] },
  { slug: 'rajkot',       name: 'Rajkot',       state: 'Gujarat',      region: 'West',    lat: 22.2730, lng: 70.7519, tier: 'tier2',   knownFor: [' Saurashtra region hub', 'education city', 'jewellery hub'],           popularLocalities: ['150 Feet Road', 'Astron Circle', 'Kalawad Road', 'University Road', 'Mavdi', 'Kothariya'] },
  { slug: 'nagpur',       name: 'Nagpur',       state: 'Maharashtra',  region: 'West',    lat: 21.1458, lng: 79.0882, tier: 'tier2',   knownFor: ['orange city', ' Vidarbha region hub', 'geographic centre of India'],   popularLocalities: ['Dharampeth', 'Sitabuldi', 'Ramdaspeth', 'Civil Lines', 'Manish Nagar', 'Hingna', 'Bajaj Nagar'] },
  { slug: 'coimbatore',   name: 'Coimbatore',   state: 'Tamil Nadu',    region: 'South',   lat: 11.0168, lng: 76.9558, tier: 'tier2',   knownFor: ['Manchester of South India', 'textile hub', 'educational city'],     popularLocalities: ['RS Puram', 'Peelamedu', 'Ganapathy', 'Saravanampatti', 'Singanallur', 'Kalapatti', 'Vadavalli'] },
  { slug: 'visakhapatnam',name: 'Visakhapatnam',state: 'AP',           region: 'South',   lat: 17.6868, lng: 83.2185, tier: 'tier2',   knownFor: ['port city', 'IT hub emerging', 'Beach city'],                        popularLocalities: ['MVP Colony', 'Seethammadhara', 'Dwaraka Nagar', 'Gajuwaka', 'Anandapuram', 'Rushikonda', 'Beach Road'] },
  { slug: 'mangalore',    name: 'Mangalore',    state: 'Karnataka',    region: 'South',   lat: 12.9141, lng: 74.8560, tier: 'tier2',   knownFor: ['port city', 'Mangalorean cuisine', 'educational hub'],               popularLocalities: ['Bunder', 'Hampankatta', 'Kankanady', 'Bejai', 'Kadri', 'Bantwal', 'Moodbidri'] },
  { slug: 'mysore',       name: 'Mysore',       state: 'Karnataka',    region: 'South',   lat: 12.2958, lng: 76.6390, tier: 'tier2',   knownFor: ['palace city', 'heritage tourism', 'silk city'],                       popularLocalities: ['Mandi Mohalla', 'Gokulam', 'Jayaprakash Nagar', 'T K Layout', 'Hebbal', 'Bogadi', 'Hunsur Road'] },
  { slug: 'dehradun',     name: 'Dehradun',     state: 'Uttarakhand',  region: 'North',   lat: 30.3165, lng: 78.0322, tier: 'tier2',   knownFor: ['capital of Uttarakhand', 'tourism hub', 'scenic beauty'],           popularLocalities: ['Rajpur Road', 'Mussoorie Road', 'Dhanaulti Road', 'Ballupur', 'Nehru Colony', 'Garhi Cantt', 'Clement Town'] },
  { slug: 'patna',        name: 'Patna',        state: 'Bihar',        region: 'East',    lat: 25.5941, lng: 85.1376, tier: 'tier2',   knownFor: ['capital of Bihar', 'ancient city', 'Ganga river'],                      popularLocalities: ['Boring Road', 'Kankarbagh', 'Patliputra', 'Rajendra Nagar', 'Gulshanbagh', ' Bailey Road', 'Exhibition Road'] },
  { slug: 'bhubaneswar',  name: 'Bhubaneswar',  state: 'Odisha',       region: 'East',    lat: 20.2961, lng: 85.8245, tier: 'tier2',   knownFor: ['temple city', 'IT hub', 'capital of Odisha'],                      popularLocalities: ['Nayapalli', 'Jaydev Vihar', 'Patia', 'Chandrasekharpur', 'Kalinga Nagar', 'Bomikhal', 'Old Town'] },
  { slug: 'raipur',       name: 'Raipur',       state: 'Chhattisgarh', region: 'Central', lat: 21.2514, lng: 81.6296, tier: 'tier2',   knownFor: ['capital of Chhattisgarh', 'steel city', 'industrial growth'],     popularLocalities: ['Shankar Nagar', 'Telibandha', 'Mahadev Ghat', 'Pandri', 'Bhatapara', 'Naya Raipur', 'Devendra Nagar'] },
  { slug: 'ranchi',       name: 'Ranchi',       state: 'Jharkhand',    region: 'East',    lat: 23.3441, lng: 85.3095, tier: 'tier2',   knownFor: ['capital of Jharkhand', 'forest city', 'hills and waterfalls'],     popularLocalities: ['Hinoo', 'Kanke Road', 'Lalpur', 'Harmu', 'Birhor Colony', 'Bariatu', 'Main Road'] },
  { slug: 'jamshedpur',   name: 'Jamshedpur',   state: 'Jharkhand',    region: 'East',    lat: 22.8006, lng: 86.1860, tier: 'tier2',   knownFor: ['steel city', 'Tata Motors hometown', 'planned city'],                  popularLocalities: ['Bistupur', 'Jamshedpur Town', 'Telco', 'Adityapur', 'MGM', 'Sakchi', 'Golmuri'] },
  { slug: 'guwahati',     name: 'Guwahati',     state: 'Assam',        region: 'East',    lat: 26.1445, lng: 91.7362, tier: 'tier2',   knownFor: ['gateway to Northeast India', 'Kamakhya temple', ' Brahmaputra river'],  popularLocalities: ['Guwahati Central', 'Beltola', 'Dispur', 'Borato', 'Pan Bazaar', 'Uzan Bazar', 'Paltan Bazaar'] },

  // ── Tier 3 State Capitals & Emerging ─────────────────────
  { slug: 'ludhiana',     name: 'Ludhiana',     state: 'Punjab',       region: 'North',   lat: 30.9009, lng: 75.8573, tier: 'tier3_capital', knownFor: ['industrial hub Punjab', 'Manchester of India', 'DAV colleges'],     popularLocalities: ['Civil Lines', 'Model Town', 'Samrala', 'Focal Point', 'Dugri', 'BRS Nagar', 'PAU'] },
  { slug: 'jalandhar',    name: 'Jalandhar',    state: 'Punjab',       region: 'North',   lat: 31.3260, lng: 75.5762, tier: 'tier3_capital', knownFor: ['sports goods capital', 'education hub', 'DOABA region'],             popularLocalities: ['Model Town', 'New Jalandhar', 'Adarsh Nagar', 'Cool Road', 'Sujanpur', 'Cantt Area', 'Guru Nanak Nagar'] },
  { slug: 'kanpur',       name: 'Kanpur',      state: 'UP',           region: 'North',   lat: 26.4499, lng: 80.3319, tier: 'tier3_capital', knownFor: ['industrial city', 'leather city', 'old educational'],            popularLocalities: ['Swaroop Nagar', 'Civil Lines', 'Parade', 'Ganesh Nagar', 'Kakadeo', 'Juhi', 'Birhana Road'] },
  { slug: 'allahabad',   name: 'Prayagraj',    state: 'UP',           region: 'North',   lat: 25.4443, lng: 81.8459, tier: 'tier3_capital', knownFor: ['Triveni Sangam', 'old name Allahabad', 'educational city'],      popularLocalities: ['Civil Lines', 'Cantonment', 'Mahatma Road', 'Muirabad', 'Old Katra', 'Naini', 'Mumfordganj'] },
  { slug: 'varanasi',     name: 'Varanasi',     state: 'UP',           region: 'North',   lat: 25.3176, lng: 82.9739, tier: 'tier3_capital', knownFor: ['spiritual capital', 'Kashi Vishwanath', 'Ghats of Ganga'],     popularLocalities: ['Godowlia', 'Lakshmanpuri', 'Rampur', 'Duhaiya', 'Chunar', 'Ramnagar', 'Sigra'] },
  { slug: 'srinagar',     name: 'Srinagar',    state: 'J&K',          region: 'North',   lat: 34.0837, lng: 74.7973, tier: 'tier3_capital', knownFor: ['summer capital J&K', 'Dal Lake', ' Mughal gardens'],           popularLocalities: ['Lalbagh', 'Rajbagh', 'Gupkar Road', 'Shalimar', 'Badamibagh', 'Parimpora', 'Srinagar Central'] },
  { slug: 'jammu',        name: 'Jammu',       state: 'J&K',          region: 'North',   lat: 32.7266, lng: 74.8570, tier: 'tier3_capital', knownFor: ['winter capital J&K', 'temple city', 'Raghunath temple'],       popularLocalities: ['Jammu City', 'Gandhi Nagar', 'Jammu University', 'Bahu Plaza', 'Canal Road', 'Rani Bagh', 'Jawahar Nagar'] },
  { slug: 'shimla',       name: 'Shimla',      state: 'HP',           region: 'North',   lat: 31.1048, lng: 77.1734, tier: 'tier3_capital', knownFor: ['summer capital HP', 'British colonial heritage', 'tourism'],        popularLocalities: ['Mall Road', 'The Ridge', 'Lakkar Bazar', 'Chhota Shimla', 'Sanjauli', 'New Shimla', 'Kufri Road'] },
  { slug: 'goa',          name: 'Goa',         state: 'Goa',          region: 'West',    lat: 15.2993, lng: 74.1240, tier: 'tier3_capital', knownFor: ['beach destination', 'tourism capital', 'Portuguese heritage'],       popularLocalities: ['Panaji', 'Margao', 'Vasco', 'Anjuna', 'Calangute', 'Baga', 'Ponda'] },
  { slug: 'trivandrum',   name: 'Thiruvananthapuram', state: 'Kerala', region: 'South',   lat: 8.5241,  lng: 76.9366, tier: 'tier3_capital', knownFor: ['capital of Kerala', 'Kovalam beach', 'IT hub emerging'],          popularLocalities: ['Kowdiar', 'Peroorkada', 'Pattom', 'Kazhakkoottam', 'Vellayambalam', 'Trivandrum Central', 'Poojapura'] },
  { slug: 'madurai',      name: 'Madurai',     state: 'Tamil Nadu',   region: 'South',   lat: 9.9252,  lng: 78.1198, tier: 'tier3_capital', knownFor: ['Temple city', 'Meenakshi Amman temple', 'historical significance'], popularLocalities: ['Anna Nagar', 'KK Nagar', 'Tirumangalam', 'Thirunagar', 'Sellur', 'Narimedu', 'Iyyappanthangal'] },

  // ── Tier 3 Emerging ───────────────────────────────────────
  { slug: 'gwalior',      name: 'Gwalior',     state: 'MP',           region: 'Central', lat: 26.2183, lng: 78.1828, tier: 'tier3_other', knownFor: ['historic fort city', 'Jai Vilas Palace', 'educational hub'],    popularLocalities: ['Lashkar', 'Maharajbada', 'Naya Bazaar', 'Thatipur', 'Deen Dayal Nagar', 'Morbhan Kalan', 'Sikandar Keth'] },
  { slug: 'jabalpur',    name: 'Jabalpur',    state: 'MP',           region: 'Central', lat: 23.1815, lng: 79.9864, tier: 'tier3_other', knownFor: ['marble rocks Bhedaghat', 'educational hub', 'defence production'], popularLocalities: ['Napier Town', 'Wright Town', 'Vijay Nagar', 'Madhupuri', 'Ranjhi', 'Garha', 'Sadar'] },
  { slug: 'bilaspur',     name: 'Bilaspur',    state: 'Chhattisgarh', region: 'Central', lat: 22.0797, lng: 82.1389, tier: 'tier3_other', knownFor: ['rice bowl of Chhattisgarh', 'steel plants', 'coal hub'],           popularLocalities: ['Link Road', 'Sardar Bazar', 'Tata Chowk', 'Kanan', 'Bodri', 'Sarkanda', 'Mungeli Road'] },
  { slug: 'siliguri',     name: 'Siliguri',    state: 'West Bengal',  region: 'East',    lat: 26.7271, lng: 88.3952, tier: 'tier3_other', knownFor: ['gateway to Northeast', 'tea gardens', 'trade hub'],               popularLocalities: ['Sevoke Road', 'Mahabirsthan', 'Krishna Naga', 'Don Bosco', 'Bengal More', 'NMG Road', 'Hasimara Gate'] },
  { slug: 'aligarh',      name: 'Aligarh',     state: 'UP',           region: 'North',   lat: 27.8974, lng: 78.0770, tier: 'tier3_other', knownFor: ['AMU university city', 'lock industry', 'Pashto culture'],         popularLocalities: ['Civil Lines', 'Marris Road', 'G T Road', 'Usha Vihar', 'Sasni Gate', 'Kheragarh Road', 'Atahrauli'] },
  { slug: 'bareilly',     name: 'Bareilly',    state: 'UP',           region: 'North',   lat: 28.3670, lng: 79.4303, tier: 'tier3_other', knownFor: ['textile city', 'mango cultivation', 'civil lines district'],     popularLocalities: ['Civil Lines', 'Delhi Road', 'Pilibhit Road', 'Cantt Area', 'Kundarkhi', 'Nawab Ganj', 'Bhojpur'] },
  { slug: 'moradabad',    name: 'Moradabad',   state: 'UP',           region: 'North',   lat: 28.8388, lng: 78.7768, tier: 'tier3_other', knownFor: ['brass city of India', 'export hub', 'Dudheshwari temple'],      popularLocalities: ['Civil Lines', 'Buddhi Vihar', 'Jahangirpur Road', 'Rampur Road', 'Kundarki', 'Chandausi Road', 'Bilari Road'] },
  { slug: 'mathura',      name: 'Mathura',     state: 'UP',           region: 'North',   lat: 27.4924, lng: 77.6737, tier: 'tier3_other', knownFor: ['Vrindavan temples', 'Krishna birthplace', 'pilgrimage city'],        popularLocalities: ['Vrindavan', 'Krishna Nagar', 'Civil Lines', 'Goverdhan', 'Chhata', 'Baldeo', 'Mahaban'] },
  { slug: 'kolhapur',     name: 'Kolhapur',    state: 'Maharashtra',  region: 'West',    lat: 16.6778, lng: 74.2439, tier: 'tier3_other', knownFor: ['Mahalakshmi temple', 'kolhapuri chappal', 'sugar factories'],       popularLocalities: ['Shivaji Peth', 'Mahalaxmi', 'R K Nagar', 'Kolegaon', 'Caranzalem', 'Ujalai', 'Kaneri'] },
  { slug: 'nashik',       name: 'Nashik',     state: 'Maharashtra',  region: 'West',    lat: 19.9975, lng: 73.7898, tier: 'tier3_other', knownFor: ['wine capital of India', 'Kumbh Mela city', 'trimbakeshwar'],         popularLocalities: ['Panchavati', 'Nashik Road', 'CIDCO', 'Gangapur Road', 'Pathardi', 'Nashik East', 'Nashik West'] },
  { slug: 'aurangabad',   name: 'Aurangabad',  state: 'Maharashtra',  region: 'West',    lat: 19.8762, lng: 75.3433, tier: 'tier3_other', knownFor: ['Ajanta Ellora caves nearby', 'silk city', 'industrial corridor'],   popularLocalities: ['Cidco', 'Aurangabad Railway Station', 'Jalna Road', 'Osmanpura', 'Nawabpur', 'Paithan Road', 'Chikalthana'] },
  { slug: 'saharanpur',   name: 'Saharanpur',  state: 'UP',           region: 'North',   lat: 29.9647, lng: 77.5424, tier: 'tier3_other', knownFor: ['wooden furniture city', 'jute industry', 'UP Uttarakhand border'],  popularLocalities: ['Civil Lines', 'Ambala Road', 'Sharanpur Road', 'Manoharpur', 'Kashmir Colony', 'Bhagwanpur', 'Kairana Road'] },
];

// ─── 8 NCR Full Overrides (preserved from earlier work) ───────────────────────
const NCR_OVERRIDES = {
  gurugram: {
    displayName: 'Gurugram', displayIcon: '🏙️',
    h1: 'Rent Flats & Apartments in Gurugram — Zero Brokerage',
    title: 'Rent Flats in Gurugram | 2BHK 3BHK for Rent | Vertex Living',
    description: 'Find verified 2BHK, 3BHK flats for rent in Gurugram. Zero brokerage. Direct from owners. Golf Course Road, Sector 42, 43, 57, 65, 66, 67, New Gurugram (Sectors 82–108), Sohna Road. Updated daily.',
    keywords: 'rent flat gurugram, flats for rent gurugram, 2bhk rent gurugram, 3bhk rent gurugram, 4bhk rent gurugram, villa rent gurugram, pg gurugram, property for rent gurugram',
    ogTitle: 'Rent Flats in Gurugram | Zero Brokerage | Vertex Living',
    ogDesc: '2BHK, 3BHK, 4BHK flats for rent in Gurugram. Zero brokerage. Direct from verified owners.',
    geoRegion: 'IN-HR', geoPosition: '28.4595;77.0266',
    lat: 28.4595, lng: 77.0266, region: 'Haryana',
    intro: 'Gurugram (also spelled Gurgaon) is the financial and IT hub of North India, located in Haryana along the Delhi-Gurgaon Expressway. Home to Fortune 500 companies and premium residential townships, Gurugram offers the finest rental options in NCR — from luxury apartments on Golf Course Road to affordable flats in New Gurgaon. Vertex Living connects tenants directly with verified landlords across all Gurugram localities.',
    popularSectors: ['Golf Course Road', 'Sector 42', 'Sector 43', 'Sector 57', 'Sector 65', 'Sector 67', 'Sohna Road', 'Dwarka Expressway', 'New Gurgaon (82–108)'],
  },
  gurgaon: {
    displayName: 'Gurgaon', displayIcon: '🏙️',
    h1: 'Rent Flats & Apartments in Gurgaon — Zero Brokerage',
    title: 'Rent Flats in Gurgaon | 2BHK 3BHK for Rent NCR | Vertex Living',
    description: 'Browse verified rental flats in Gurgaon. 2BHK, 3BHK, 4BHK, villas, PGs. Zero brokerage. Direct from owners. DLF Cyber City, Golf Course Road, New Gurgaon. Updated daily.',
    keywords: 'rent flat gurgaon, flats for rent gurgaon, 2bhk rent gurgaon, 3bhk rent gurgaon, villa rent gurgaon, pg gurgaon, property for rent gurgaon, luxury flat gurgaon',
    ogTitle: 'Rent Flats in Gurgaon | Zero Brokerage | Vertex Living',
    ogDesc: '2BHK, 3BHK, 4BHK flats for rent in Gurgaon. Zero brokerage. Direct from verified owners.',
    geoRegion: 'IN-HR', geoPosition: '28.4595;77.0266',
    lat: 28.4595, lng: 77.0266, region: 'Haryana',
    intro: 'Gurgaon is one of India\'s most dynamically growing cities, part of the Delhi NCR region. With world-class infrastructure, top multinational offices, and premium residential projects, Gurgaon is the top choice for professionals and families looking for quality rentals. From DLF Cyber City to New Gurgaon townships, Vertex Living lists hundreds of verified rental properties across all price segments.',
    popularSectors: ['Golf Course Road', 'Sector 42', 'Sector 57', 'Sector 65', 'Cyber City', 'MG Road', 'Sohna Road', 'Dwarka Expressway', 'New Gurgaon'],
  },
  delhi: {
    displayName: 'Delhi', displayIcon: '🏛️',
    h1: 'Rent Flats & Apartments in Delhi — Zero Brokerage',
    title: 'Rent Flats in Delhi | 2BHK 3BHK for Rent | Vertex Living',
    description: 'Find verified rental flats in Delhi. Zero brokerage. Direct from owners. Lajpat Nagar, Dwarka, Vasant Kunj, Saket, Rohini, Pitampura, RK Puram. Updated daily.',
    keywords: 'rent flat delhi, flats for rent delhi, 2bhk rent delhi, 3bhk rent delhi, 4bhk rent delhi, villa rent delhi, pg delhi, property for rent delhi, luxury flat delhi',
    ogTitle: 'Rent Flats in Delhi | Zero Brokerage | Vertex Living',
    ogDesc: 'Flats for rent across Delhi. Zero brokerage. Direct from verified owners.',
    geoRegion: 'IN-DL', geoPosition: '28.6139;77.2090',
    lat: 28.6139, lng: 77.2090, region: 'Delhi',
    intro: 'Delhi, India\'s capital, offers unmatched rental diversity — from affordable builder floors in South Delhi to premium apartments in Dwarka and Vasant Kunj. The city\'s metro connectivity makes commuting easy across all localities. Vertex Living brings you verified rental listings across all major Delhi localities with zero brokerage.',
    popularSectors: ['Dwarka', 'Rohini', 'Lajpat Nagar', 'Vasant Kunj', 'Saket', 'Pitampura', 'RK Puram', 'Mayur Vihar', 'Paharganj'],
  },
  noida: {
    displayName: 'Noida', displayIcon: '🌆',
    h1: 'Rent Flats & Apartments in Noida — Zero Brokerage',
    title: 'Rent Flats in Noida | 2BHK 3BHK for Rent | Vertex Living',
    description: 'Find verified rental flats in Noida. Zero brokerage. Direct from owners. Sector 62, 63, 76, 100, 104, 105, 107, 108. Updated daily.',
    keywords: 'rent flat noida, flats for rent noida, 2bhk rent noida, 3bhk rent noida, villa rent noida, pg noida, property for rent noida',
    ogTitle: 'Rent Flats in Noida | Zero Brokerage | Vertex Living',
    ogDesc: 'Flats for rent in Noida. Zero brokerage. Direct from verified owners.',
    geoRegion: 'IN-UP', geoPosition: '28.5355;77.3910',
    lat: 28.5355, lng: 77.3910, region: 'Uttar Pradesh',
    intro: 'Noida (New Okhla Industrial Development Authority) is a rapidly growing city in Gautam Buddha Nagar district of Uttar Pradesh, part of Delhi NCR. Known for its planned layout, IT parks, and excellent metro connectivity via the Blue Line, Noida offers premium rental options at competitive prices compared to Delhi and Gurugram. Vertex Living lists verified rental properties across all Noida sectors.',
    popularSectors: ['Sector 62', 'Sector 63', 'Sector 76', 'Sector 78', 'Sector 100', 'Sector 104', 'Sector 105', 'Sector 107', 'Sector 108', 'Sector 137'],
  },
  'greater-noida': {
    displayName: 'Greater Noida', displayIcon: '🌿',
    h1: 'Rent Flats & Apartments in Greater Noida — Zero Brokerage',
    title: 'Rent Flats in Greater Noida | 2BHK 3BHK for Rent | Vertex Living',
    description: 'Find verified rental flats in Greater Noida. Zero brokerage. Direct from owners. Alpha 1, Alpha 2, Gamma 1, Gamma 2, Omega 1, TechZone. Updated daily.',
    keywords: 'rent flat greater noida, flats for rent greater noida, 2bhk rent greater noida, 3bhk rent greater noida, villa rent greater noida, property for rent greater noida',
    ogTitle: 'Rent Flats in Greater Noida | Zero Brokerage | Vertex Living',
    ogDesc: 'Flats for rent in Greater Noida. Zero brokerage. Direct from verified owners.',
    geoRegion: 'IN-UP', geoPosition: '28.4744;77.5037',
    lat: 28.4744, lng: 77.5037, region: 'Uttar Pradesh',
    intro: 'Greater Noida is a planned city in Gautam Buddha Nagar district, known for its wide roads, green spaces, and growing educational institutions like Galgotias University and Greater Noida Knowledge Park. The Yamuna Expressway has spurred rapid development, making Greater Noida an emerging hub for both residential and commercial rentals. Vertex Living offers zero-brokerage rental listings across all Greater Noida localities.',
    popularSectors: ['Alpha 1', 'Alpha 2', 'Beta 1', 'Beta 2', 'Gamma 1', 'Gamma 2', 'Omega 1', 'TechZone', 'Pari Chowk', 'Yamuna Expressway'],
  },
  jaipur: {
    displayName: 'Jaipur', displayIcon: '🏰',
    h1: 'Rent Flats & Apartments in Jaipur — Zero Brokerage',
    title: 'Rent Flats in Jaipur | 2BHK 3BHK for Rent | Vertex Living',
    description: 'Find verified rental flats in Jaipur. Zero brokerage. Direct from owners. Vaishali Nagar, Mansarovar, MI Road, Jagatpur, Ajmer Road, Tonk Road. Updated daily.',
    keywords: 'rent flat jaipur, flats for rent jaipur, 2bhk rent jaipur, 3bhk rent jaipur, villa rent jaipur, pg jaipur, property for rent jaipur, luxury flat jaipur',
    ogTitle: 'Rent Flats in Jaipur | Zero Brokerage | Vertex Living',
    ogDesc: 'Flats for rent in Jaipur (Pink City). Zero brokerage. Direct from verified owners.',
    geoRegion: 'IN-RJ', geoPosition: '26.9124;75.7873',
    lat: 26.9124, lng: 75.7873, region: 'Rajasthan',
    intro: 'Jaipur, the capital city of Rajasthan and the Pink City of India, is a major cultural and economic hub in North India. With growing IT and manufacturing sectors, Jaipur offers excellent rental opportunities across diverse neighbourhoods — from the historic walled city to modern townships on Ajmer Road and Tonk Road. Vertex Living provides verified, zero-brokerage rental listings throughout Jaipur.',
    popularSectors: ['Vaishali Nagar', 'Mansarovar', 'MI Road', 'C-Scheme', 'Bani Park', 'Jagatpur', 'Ajmer Road', 'Tonk Road', 'Sanganer', 'Sitapura'],
  },
  faridabad: {
    displayName: 'Faridabad', displayIcon: '🏭',
    h1: 'Rent Flats & Apartments in Faridabad — Zero Brokerage',
    title: 'Rent Flats in Faridabad | 2BHK 3BHK for Rent | Vertex Living',
    description: 'Find verified rental flats in Faridabad. Zero brokerage. Direct from owners. Sector 12, 14, 15, 16, 21, 28, 35, 37. Updated daily.',
    keywords: 'rent flat faridabad, flats for rent faridabad, 2bhk rent faridabad, 3bhk rent faridabad, villa rent faridabad, pg faridabad, property for rent faridabad',
    ogTitle: 'Rent Flats in Faridabad | Zero Brokerage | Vertex Living',
    ogDesc: 'Flats for rent in Faridabad. Zero brokerage. Direct from verified owners.',
    geoRegion: 'IN-HR', geoPosition: '28.4089;77.3178',
    lat: 28.4089, lng: 77.3178, region: 'Haryana',
    intro: 'Faridabad is a major industrial city in Haryana, part of Delhi NCR, situated along the Delhi–Mathura road. Well-connected via the Delhi Metro Pink Line and the Faridabad–Noida–Ghaziabad Expressway, Faridabad offers affordable rental options with excellent connectivity. Vertex Living provides verified zero-brokerage rentals across all Faridabad sectors.',
    popularSectors: ['Sector 12', 'Sector 14', 'Sector 15', 'Sector 16', 'Sector 21', 'Sector 28', 'Sector 35', 'Sector 37', 'Sector 70', 'Sector 81'],
  },
  ghaziabad: {
    displayName: 'Ghaziabad', displayIcon: '🌐',
    h1: 'Rent Flats & Apartments in Ghaziabad — Zero Brokerage',
    title: 'Rent Flats in Ghaziabad | 2BHK 3BHK for Rent | Vertex Living',
    description: 'Find verified rental flats in Ghaziabad. Zero brokerage. Direct from owners. Raj Nagar, Vaishali, Indirapuram, Crossing Republik, Vasundhara. Updated daily.',
    keywords: 'rent flat ghaziabad, flats for rent ghaziabad, 2bhk rent ghaziabad, 3bhk rent ghaziabad, villa rent ghaziabad, pg ghaziabad, property for rent ghaziabad',
    ogTitle: 'Rent Flats in Ghaziabad | Zero Brokerage | Vertex Living',
    ogDesc: 'Flats for rent in Ghaziabad. Zero brokerage. Direct from verified owners.',
    geoRegion: 'IN-UP', geoPosition: '28.6692;77.4538',
    lat: 28.6692, lng: 77.4538, region: 'Uttar Pradesh',
    intro: 'Ghaziabad is one of the fastest-growing cities in UP, part of Delhi NCR. Strategically located between Delhi and Noida, Ghaziabad offers excellent connectivity via the Delhi Metro Red Line and the FNG Expressway. With rapidly developing localities like Indirapuram, Vaishali, and Crossing Republik, Ghaziabad provides quality rental options at competitive prices. Vertex Living lists verified zero-brokerage rentals across all major Ghaziabad localities.',
    popularSectors: ['Raj Nagar', 'Vaishali', 'Indirapuram', 'Crossing Republik', 'Vasundhara', 'Shahibabad', 'Loni', 'Modinagar'],
  },
};

// ─── Tier Templates ───────────────────────────────────────────────────────────

const ICONS = { tier1: '🏙️', tier2: '🌆', 'tier3_capital': '🏛️', tier3_other: '🌐' };

const TIER_TEMPLATES = {
  tier1: (city) => ({
    displayName: city.name,
    displayIcon: ICONS.tier1,
    h1: `Rent Flats & Apartments in ${city.name} — Zero Brokerage`,
    title: `Rent Flats in ${city.name} | 2BHK 3BHK for Rent | Vertex Living`,
    description: `Find verified 2BHK, 3BHK flats for rent in ${city.name}. Zero brokerage. Direct from owners. ${city.popularLocalities.slice(0,5).join(', ')}. Updated daily.`,
    keywords: `rent flat ${city.slug}, flats for rent ${city.slug}, 2bhk rent ${city.slug}, 3bhk rent ${city.slug}, 4bhk rent ${city.slug}, villa rent ${city.slug}, pg ${city.slug}, property for rent ${city.slug}, luxury flat ${city.slug}`,
    ogTitle: `Rent Flats in ${city.name} | Zero Brokerage | Vertex Living`,
    ogDesc: `2BHK, 3BHK, 4BHK flats for rent in ${city.name}. Zero brokerage. Direct from verified owners.`,
    geoRegion: `IN-${city.state.substring(0,2).toUpperCase()}`,
    geoPosition: `${city.lat};${city.lng}`,
    lat: city.lat, lng: city.lng, region: city.state,
    intro: `${city.name} is ${city.knownFor.length > 1 ? `one of India's most important cities — known as the ${city.knownFor[0]} and ${city.knownFor[1]}` : `India's ${city.knownFor[0]}`}. As a major metropolitan centre, ${city.name} attracts professionals, families, and students from across the country. The city offers a diverse range of rental options — from premium apartments in gated communities to affordable builder floors in established neighbourhoods. With excellent metro connectivity and world-class social infrastructure, ${city.name} is among the most sought-after rental destinations in India. Vertex Living brings you verified zero-brokerage rental listings across all major ${city.name} localities including ${city.popularLocalities.slice(0,6).join(', ')}.`,
    popularSectors: city.popularLocalities.slice(0, 9),
  }),

  tier2: (city) => ({
    displayName: city.name,
    displayIcon: ICONS.tier2,
    h1: `Rent Flats & Apartments in ${city.name} — Zero Brokerage`,
    title: `Rent Flats in ${city.name} | 2BHK 3BHK for Rent | Vertex Living`,
    description: `Find verified rental flats in ${city.name}, ${city.state}. Zero brokerage. Direct from owners. ${city.popularLocalities.slice(0,4).join(', ')}. Updated daily.`,
    keywords: `rent flat ${city.slug}, flats for rent ${city.slug}, 2bhk rent ${city.slug}, 3bhk rent ${city.slug}, villa rent ${city.slug}, pg ${city.slug}, property for rent ${city.slug}`,
    ogTitle: `Rent Flats in ${city.name} | Zero Brokerage | Vertex Living`,
    ogDesc: `Verified rental flats in ${city.name}. Zero brokerage. Direct from owners.`,
    geoRegion: `IN-${city.state.substring(0,2).toUpperCase()}`,
    geoPosition: `${city.lat};${city.lng}`,
    lat: city.lat, lng: city.lng, region: city.state,
    intro: `${city.name} is a rapidly growing city in ${city.state}, emerging as a key ${city.knownFor[0]}. With improving infrastructure, expanding IT and industrial zones, and a growing population of young professionals, ${city.name} offers excellent rental opportunities across diverse price segments. Compared to major metros, ${city.name} provides quality housing at more affordable rents while maintaining good connectivity to major employment hubs. Vertex Living lists verified zero-brokerage rental properties across all popular ${city.name} localities including ${city.popularLocalities.slice(0,5).join(', ')}.`,
    popularSectors: city.popularLocalities.slice(0, 7),
  }),

  tier3_capital: (city) => ({
    displayName: city.name,
    displayIcon: ICONS['tier3_capital'],
    h1: `Rent Flats & Apartments in ${city.name} — Zero Brokerage`,
    title: `Rent Flats in ${city.name} | 2BHK 3BHK for Rent | Vertex Living`,
    description: `Find verified rental flats in ${city.name}, ${city.state}. Zero brokerage. Direct from owners. Updated daily.`,
    keywords: `rent flat ${city.slug}, flats for rent ${city.slug}, 2bhk rent ${city.slug}, 3bhk rent ${city.slug}, property for rent ${city.slug}`,
    ogTitle: `Rent Flats in ${city.name} | Zero Brokerage | Vertex Living`,
    ogDesc: `Verified rental flats in ${city.name}. Zero brokerage. Direct from owners.`,
    geoRegion: `IN-${city.state.substring(0,2).toUpperCase()}`,
    geoPosition: `${city.lat};${city.lng}`,
    lat: city.lat, lng: city.lng, region: city.state,
    intro: `${city.name}, the capital of ${city.state}, is an important administrative and cultural centre ${city.knownFor.length > 1 ? `known for ${city.knownFor[0]} and ${city.knownFor[1]}` : `known for ${city.knownFor[0]}`}. The city offers a mix of traditional and modern housing options, with rental prices that are more affordable compared to major metros. ${city.name} has a strong base of government employees, educators, and an emerging private sector, making it a steady rental market. Vertex Living provides verified zero-brokerage rental listings across ${city.name}'s key localities.`,
    popularSectors: city.popularLocalities.slice(0, 5),
  }),

  tier3_other: (city) => ({
    displayName: city.name,
    displayIcon: ICONS.tier3_other,
    h1: `Rent Flats in ${city.name} — Zero Brokerage | Vertex Living`,
    title: `Rent Flats in ${city.name} | Zero Brokerage | Vertex Living`,
    description: `Find verified rental flats in ${city.name}, ${city.state}. Zero brokerage. Direct from owners. Updated daily.`,
    keywords: `rent flat ${city.slug}, flats for rent ${city.slug}, 2bhk rent ${city.slug}, 3bhk rent ${city.slug}, property for rent ${city.slug}`,
    ogTitle: `Rent Flats in ${city.name} | Zero Brokerage | Vertex Living`,
    ogDesc: `Verified rental flats in ${city.name}, ${city.state}. Zero brokerage. Direct from owners.`,
    geoRegion: `IN-${city.state.substring(0,2).toUpperCase()}`,
    geoPosition: `${city.lat};${city.lng}`,
    lat: city.lat, lng: city.lng, region: city.state,
    intro: `${city.name} is an emerging city in ${city.state}, ${city.knownFor.length > 1 ? `known for ${city.knownFor[0]} and ${city.knownFor[1]}` : `known for ${city.knownFor[0]}`}. The city's growing economy and improving infrastructure are attracting more professionals and families, driving demand for quality rental housing. ${city.name} offers affordable rental options compared to larger cities, making it an attractive destination for budget-conscious tenants. Vertex Living lists verified zero-brokerage rental properties in ${city.name} across all popular localities.`,
    popularSectors: city.popularLocalities.slice(0, 4),
  }),
};

// ─── City Aliases (old data compatibility) ─────────────────────────────────────
const CITY_ALIASES = {
  bombay: 'mumbai', calcutta: 'kolkata', madras: 'chennai',
  poona: 'pune', banaglore: 'bangalore', banglore: 'bangalore',
 Bombay: 'mumbai', Calcutta: 'kolkata', Madras: 'chennai',
};

// ─── Generate City Config ──────────────────────────────────────────────────────
export function generateCityConfig(slug) {
  const norm = slug.toLowerCase().trim();

  // 1. Check NCR overrides first
  if (NCR_OVERRIDES[norm]) return NCR_OVERRIDES[norm];

  // 2. Check aliases
  const aliasTarget = CITY_ALIASES[norm];
  if (aliasTarget && NCR_OVERRIDES[aliasTarget]) return NCR_OVERRIDES[aliasTarget];

  // 3. Look up in ALL_CITIES
  const city = ALL_CITIES.find(c => c.slug === norm);
  if (city) {
    const templateFn = TIER_TEMPLATES[city.tier];
    if (templateFn) return templateFn(city);
  }

  // 4. Unknown city — generate generic fallback
  const slugified = norm.replace(/[^a-z0-9]/g, ' ');
  return {
    displayName: slugified.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    displayIcon: '📍',
    h1: `Rent Flats in ${slugified} — Zero Brokerage | Vertex Living`,
    title: `Rent Flats in ${slugified} | Zero Brokerage | Vertex Living`,
    description: `Find verified rental flats in ${slugified}. Zero brokerage. Direct from owners. Updated daily on Vertex Living.`,
    keywords: `rent flat ${norm}, flats for rent ${norm}, property for rent ${norm}`,
    ogTitle: `Rent Flats in ${slugified} | Zero Brokerage | Vertex Living`,
    ogDesc: `Verified rental flats in ${slugified}. Zero brokerage. Direct from owners.`,
    geoRegion: 'IN', geoPosition: '20.5937;78.9629',
    lat: 20.5937, lng: 78.9629, region: 'India',
    intro: `Browse verified rental properties in ${slugified}. All listings on Vertex Living come with zero brokerage — direct from verified owners and landlords. Updated daily with new flats, apartments, villas, and PGs.`,
    popularSectors: ['All Localities'],
  };
}

// ─── Lookup helpers ────────────────────────────────────────────────────────────
export function getCityBySlug(slug) {
  return ALL_CITIES.find(c => c.slug === slug.toLowerCase()) || null;
}

export function getAllSlugs() {
  return ALL_CITIES.map(c => c.slug);
}

export function getCitiesByRegion() {
  const groups = { North: [], South: [], East: [], West: [], Central: [] };
  ALL_CITIES.forEach(c => {
    if (groups[c.region]) groups[c.region].push(c);
  });
  return groups;
}