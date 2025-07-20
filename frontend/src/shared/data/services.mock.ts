export const MOCK_SERVICES = [
  {
    name: "Financial",
    service_id: "financial",
    short_description: "Comprehensive financial data and verification services",
    long_description: `## Financial Services

Our financial services category provides comprehensive tools for financial data analysis, verification, and market intelligence. Whether you're building fintech applications, conducting financial research, or need reliable verification services, our APIs cover all major financial domains.

### Key Features
- **Bank Card Verification**: Multi-element verification for UnionPay cards
- **Real-time Market Data**: Stock prices, forex rates, and cryptocurrency data
- **Financial Analytics**: Historical data, technical indicators, and market insights
- **Investment Tools**: ETF analysis, options chains, and portfolio management
- **Calculation Services**: Loan calculators and mortgage planning tools

### Use Cases
- Fintech application development
- Investment platform integration
- Financial compliance and verification
- Market research and analysis
- Personal finance management tools`,
    tools: [
      {
        name: "Bank Card Four-Element Verification",
        description:
          "Verifies consistency of name, phone number, ID number, and bank card number for all UnionPay cards.",
      },
      {
        name: "Bank Card Three-Element Verification",
        description:
          "Verifies consistency of name, ID number, and bank card number for all UnionPay cards.",
      },
      {
        name: "Bank Card Two-Element Verification",
        description:
          "Verifies consistency of name and bank card number for all UnionPay cards.",
      },
      {
        name: "Yahoo Finance Data Query",
        description:
          "Provides real-time stock and quote data, synchronized with Yahoo Finance.",
      },
      {
        name: "National Tender and Bid Information Query",
        description:
          "Queries tender and bid information across multiple domains.",
      },
      {
        name: "Real-Time Financial Data Query",
        description:
          "Retrieves real-time stock, index, forex, and cryptocurrency data from Google Finance and other sources.",
      },
      {
        name: "Forex Factory Data Scraping",
        description:
          "Scrapes trading-related data from forexfactory.com for strategy analysis.",
      },
      {
        name: "Alpha Vantage Financial Data",
        description:
          "Provides data on stocks, ETFs, forex, technical indicators, and cryptocurrencies.",
      },
      {
        name: "Real-Time Stock Quotes",
        description: "Provides real-time stock prices and trading data.",
      },
      {
        name: "Forex Market Data Query",
        description: "Provides real-time foreign exchange rate data.",
      },
      {
        name: "Cryptocurrency Price Query",
        description: "Provides real-time cryptocurrency price data.",
      },
      {
        name: "Commodity Futures Price Query",
        description:
          "Provides real-time commodity futures prices and contract data.",
      },
      {
        name: "Stock Historical Price Query",
        description: "Queries historical stock price data.",
      },
      {
        name: "Stock Dividend Calendar Query",
        description: "Provides stock dividend dates and amounts.",
      },
      {
        name: "ETF Constituents Query",
        description: "Queries the constituent stocks and weights of ETFs.",
      },
      {
        name: "Major Index Constituents Query",
        description: "Queries constituent stocks of major market indices.",
      },
      {
        name: "Bond Yield Curve Query",
        description: "Provides bond yield curve data.",
      },
      {
        name: "Central Bank Interest Rate Announcement Query",
        description:
          "Queries central bank interest rate announcement information.",
      },
      {
        name: "IPO Schedule Query",
        description: "Queries upcoming IPO schedules and details.",
      },
      {
        name: "Earnings Release Schedule Query",
        description:
          "Queries company earnings report release dates and details.",
      },
      {
        name: "Options Chain Query",
        description:
          "Provides options chain data, including strike prices and expiration dates.",
      },
      {
        name: "Cryptocurrency Historical Price Query",
        description: "Queries historical cryptocurrency price data.",
      },
      {
        name: "Crypto Exchange Market Data Query",
        description:
          "Provides real-time market data from cryptocurrency exchanges.",
      },
      {
        name: "Gold and Silver Spot Price Query",
        description: "Provides spot price data for gold and silver.",
      },
      {
        name: "Loan Calculator",
        description: "Calculates loan interest and repayment amounts.",
      },
      {
        name: "Mortgage Repayment Schedule Generator",
        description: "Generates mortgage loan repayment schedules.",
      },
    ],
  },
  {
    name: "Logistics & Transportation",
    service_id: "logistics-transportation",
    short_description: "Global logistics tracking and transportation management",
    long_description: `## Logistics & Transportation Services

Streamline your logistics operations with our comprehensive transportation and delivery tracking solutions. From package tracking to flight schedules, our APIs provide real-time visibility across all transportation modes.

### Key Features
- **Express Tracking**: Support for 100+ courier companies worldwide
- **Flight Information**: Real-time flight status and scheduling data
- **Maritime Logistics**: Shipping routes and port schedules
- **Cost Estimation**: Accurate logistics cost calculations
- **Network Intelligence**: Comprehensive logistics network data

### Use Cases
- E-commerce order tracking
- Supply chain management
- Travel planning applications
- Logistics cost optimization
- Transportation network analysis`,
    tools: [
      {
        name: "National Express Logistics Query",
        description:
          "Supports tracking for 100+ express companies, synchronized with official data, auto-identifies couriers.",
      },
      {
        name: "TrackingPackage Parcel Tracking",
        description:
          "Tracks parcels from major US carriers (UPS, USPS, FedEx, DHL).",
      },
      {
        name: "Global Express Tracking",
        description: "Tracks express delivery information worldwide.",
      },
      {
        name: "Flight Status Query",
        description: "Provides real-time flight status and updates.",
      },
      {
        name: "Shipping Route Query",
        description:
          "Queries shipping routes and progress for maritime transport.",
      },
      {
        name: "Logistics Cost Estimation",
        description: "Estimates logistics and transportation costs.",
      },
      {
        name: "Logistics Network Query",
        description:
          "Queries locations and information of logistics company branches.",
      },
      {
        name: "Flight Schedule Query",
        description: "Queries flight departure and arrival schedules.",
      },
      {
        name: "Train Schedule Query",
        description: "Queries train operation schedules.",
      },
      {
        name: "Port Shipping Schedule Query",
        description: "Queries port arrival and departure schedules for ships.",
      },
    ],
  },
  {
    name: "Messaging & Communication",
    service_id: "messaging-communication",
    short_description: "Phone number verification and communication tools",
    long_description: `## Messaging & Communication Services

Ensure reliable communication with our comprehensive phone number verification and messaging tools. Perfect for user authentication, fraud prevention, and communication platform development.

### Key Features
- **Phone Verification**: Multi-level phone number status checking
- **Network Analysis**: Carrier information and network duration tracking
- **Email Validation**: Advanced email verification and fraud detection
- **Social Verification**: WhatsApp and Truecaller integration
- **Communication Tools**: Email sending and messaging capabilities

### Use Cases
- User registration and authentication
- Fraud prevention systems
- Communication platform development
- Customer verification workflows
- Marketing campaign validation`,
    tools: [
      {
        name: "Phone Number Status Query",
        description:
          "Queries phone number status, returning results like active, inactive, or suspended.",
      },
      {
        name: "Phone Number Secondary Registration Query",
        description:
          "Checks if a phone number has been re-registered, supports major operators.",
      },
      {
        name: "Phone Number Network Status Query",
        description:
          "Queries phone number network status, returning in-network or out-of-network states.",
      },
      {
        name: "Phone Number Network Duration Query",
        description:
          "Queries the duration a phone number has been active, supports major operators.",
      },
      {
        name: "Real-Time Phone Number Status Check",
        description:
          "Real-time query of phone number status, returning normal, inactive, or off states.",
      },
      {
        name: "Phone Number Location Query",
        description:
          "Queries the geographic location of phone numbers, covering all major operators.",
      },
      {
        name: "Email Validity Check",
        description:
          "Checks if an email address is valid, identifying temporary or disposable emails.",
      },
      {
        name: "WhatsApp Number Verification",
        description:
          "Verifies WhatsApp account validity and retrieves profile picture and status.",
      },
      {
        name: "Truecaller Number Query",
        description: "Queries identity information for unknown callers.",
      },
      {
        name: "Email Sending",
        description: "Sends emails with customizable content and recipients.",
      },
    ],
  },
  {
    name: "Weather & Environment",
    service_id: "weather-environment",
    short_description: "Comprehensive weather data and environmental monitoring",
    long_description: `## Weather & Environment Services

Access real-time weather data, environmental monitoring, and natural disaster information from reliable sources. Our APIs provide minute-level accuracy for weather forecasting and comprehensive environmental intelligence.

### Key Features
- **Real-time Weather**: Minute-level weather updates for global cities
- **Air Quality Monitoring**: Hourly air quality data for 3400+ cities
- **Natural Disasters**: Typhoon, earthquake, and volcanic activity tracking
- **Astronomical Data**: Moon phases, sunrise/sunset, and celestial events
- **Environmental Intelligence**: Pollen, wind, tide, and lightning data

### Use Cases
- Weather application development
- Agricultural planning and monitoring
- Disaster preparedness systems
- Outdoor activity planning
- Environmental research and analysis`,
    tools: [
      {
        name: "Weather Warning Query",
        description:
          "Retrieves weather warning information for a city or coordinates, sourced from the National Warning Center.",
      },
      {
        name: "Air Quality Query",
        description:
          "Provides hourly air quality data for 3400+ cities, supports coordinate-based queries.",
      },
      {
        name: "Weather Forecast Query",
        description:
          "Provides weather data for global cities, updated at minute-level frequency.",
      },
      {
        name: "7-Day Lifestyle Index Query",
        description:
          "Provides lifestyle index data (e.g., clothing, exercise) for multiple cities.",
      },
      {
        name: "Moonrise, Moonset, and Moon Phase Query",
        description:
          "Queries moonrise, moonset times, and moon phase data for cities.",
      },
      {
        name: "Sunrise and Sunset Query",
        description: "Queries daily sunrise and sunset times for cities.",
      },
      {
        name: "Minute-Level Precipitation Forecast Query",
        description:
          "Provides minute-level precipitation forecasts for the next 2 hours, supports any coordinates.",
      },
      {
        name: "Historical Weather Query",
        description: "Queries historical weather data for cities since 2018.",
      },
      {
        name: "Typhoon Information Query",
        description:
          "Provides real-time location and path data for typhoons over the past two years and current year.",
      },
      {
        name: "Earthquake Information Query",
        description:
          "Provides time, location, and intensity data for earthquakes.",
      },
      {
        name: "Pollen Concentration Query",
        description: "Queries pollen concentration data for specific regions.",
      },
      {
        name: "Wind Speed and Direction Query",
        description:
          "Provides wind speed and direction data for specific regions.",
      },
      {
        name: "Tide Table Query",
        description: "Queries tide times and heights for coastal areas.",
      },
      {
        name: "Astronomical Event Query",
        description:
          "Queries astronomical events like eclipses, including time and location.",
      },
      {
        name: "Lightning Warning Query",
        description: "Provides lightning activity warning information.",
      },
      {
        name: "Volcanic Eruption Query",
        description:
          "Provides location and status information for volcanic eruptions.",
      },
    ],
  },
  {
    name: "Maps & Geography",
    service_id: "maps-geography",
    short_description: "Geographic data and mapping services",
    long_description: `## Maps & Geography Services

Power your location-based applications with comprehensive geographic data and mapping tools. From postal codes to complex geographic analysis, our APIs provide the foundation for sophisticated mapping solutions.

### Key Features
- **Location Intelligence**: IP geolocation and postal code lookup
- **Google Maps Integration**: Places, business data, and geocoding services
- **Geographic Analysis**: Elevation, boundaries, and coordinate conversion
- **Route Optimization**: Distance calculation and path optimization
- **Data Formats**: GeoJSON generation and format conversion

### Use Cases
- Location-based mobile applications
- Delivery and logistics optimization
- Real estate and property services
- Geographic information systems (GIS)
- Navigation and mapping platforms`,
    tools: [
      {
        name: "Postal Code Query",
        description: "Provides postal code lookup services nationwide.",
      },
      {
        name: "IP Location Query",
        description:
          "Queries geographic location of IP addresses, supporting county-level detail in China.",
      },
      {
        name: "Vehicle Restriction Query",
        description:
          "Queries vehicle tail number restriction data for 65 cities.",
      },
      {
        name: "US Geographic Boundary Query",
        description:
          "Provides GeoJSON data for US postal codes, counties, cities, and states.",
      },
      {
        name: "Google Maps Places Query",
        description:
          "Retrieves local business info, reviews, and photos from Google Maps, supports geocoding and reverse geocoding.",
      },
      {
        name: "Local Business Data Query",
        description:
          "Retrieves addresses, websites, phone numbers, and ratings from Google Maps for local businesses and POIs.",
      },
      {
        name: "Elevation Query",
        description: "Queries elevation data for specific locations.",
      },
      {
        name: "Coordinate Conversion",
        description: "Converts coordinates between different systems.",
      },
      {
        name: "Nautical Chart and Depth Data Query",
        description: "Provides nautical chart and water depth data.",
      },
      {
        name: "Administrative Boundary Query",
        description: "Queries administrative boundary data.",
      },
      {
        name: "Distance Matrix Calculation",
        description:
          "Calculates distance and time matrices between multiple points.",
      },
      {
        name: "Multi-Point Shortest Path Optimization",
        description: "Optimizes shortest paths between multiple points.",
      },
      {
        name: "GeoJSON File Generation",
        description: "Generates GeoJSON format geographic data files.",
      },
      {
        name: "KML/GPX to GeoJSON Conversion",
        description: "Converts KML or GPX formats to GeoJSON.",
      },
      {
        name: "Coordinate System Conversion",
        description: "Converts geographic coordinate systems.",
      },
      {
        name: "Map Tile URL Generation",
        description: "Generates URLs for map tiles.",
      },
    ],
  },
  {
    name: "Social Media",
    service_id: "social-media",
    short_description: "Social media data extraction and analysis",
    long_description: `## Social Media Services

Harness the power of social media data with our comprehensive extraction and analysis tools. Access real-time content, user profiles, and trending information from major social platforms.

### Key Features
- **Multi-Platform Support**: Instagram, TikTok, Facebook, LinkedIn, Twitter, and more
- **Content Extraction**: Posts, comments, videos, and user profiles
- **Trend Analysis**: Trending topics and viral content tracking
- **Media Download**: High-quality video and image downloads
- **Professional Networks**: LinkedIn job search and professional data

### Use Cases
- Social media monitoring and analytics
- Content marketing research
- Influencer identification and analysis
- Brand sentiment tracking
- Competitive intelligence gathering`,
    tools: [
      {
        name: "Instagram Data Scraping",
        description:
          "Retrieves comments, posts, and user information from Instagram.",
      },
      {
        name: "TikTok Data Scraping",
        description: "Retrieves user profiles and video data from TikTok.",
      },
      {
        name: "TikTok Watermark-Free Video Download",
        description:
          "Downloads high-definition TikTok videos without watermarks, including full video details.",
      },
      {
        name: "Facebook Real-Time Data Query",
        description:
          "Provides real-time access to Facebook posts and comments.",
      },
      {
        name: "LinkedIn Job Search",
        description: "Queries job postings on LinkedIn, refreshed hourly.",
      },
      {
        name: "LinkedIn Data Scraping",
        description:
          "Retrieves profiles, company, and post data from LinkedIn.",
      },
      {
        name: "Twitter Data Query",
        description: "Retrieves posts, user, and follower data from Twitter.",
      },
      {
        name: "Threads Data Query",
        description: "Retrieves profile and post data from Threads. {tikz",
      },
      {
        name: "YouTube Channel Email Finder",
        description: "Finds email addresses for YouTube channels.",
      },
      {
        name: "Twitter Trending Topics Query",
        description: "Retrieves trending topics and trends data from Twitter.",
      },
      {
        name: "YouTube Video Metadata Query",
        description:
          "Queries video metadata like titles and descriptions from YouTube.",
      },
      {
        name: "Reddit Trending Posts Query",
        description: "Retrieves trending posts from Reddit.",
      },
      {
        name: "Medium Article Information Query",
        description: "Queries article content and metadata from Medium.",
      },
      {
        name: "Reddit Subreddit Information Query",
        description: "Retrieves posts and information from Reddit subreddits.",
      },
      {
        name: "Pinterest Public Image Query",
        description: "Retrieves public image data from Pinterest.",
      },
    ],
  },
  {
    name: "File Processing",
    service_id: "file-processing",
    short_description: "Document processing and text recognition services",
    long_description: `## File Processing Services

Transform and analyze documents with our advanced file processing capabilities. From OCR to format conversion, our APIs handle all your document processing needs with high accuracy and efficiency.

### Key Features
- **OCR Technology**: Multi-language text recognition from images
- **Document Conversion**: PDF, Office, and image format conversion
- **Text Analysis**: Sentiment analysis and word segmentation
- **Image Processing**: Background removal and watermark addition
- **File Manipulation**: PDF splitting, merging, and text extraction

### Use Cases
- Document digitization workflows
- Content management systems
- Automated data entry solutions
- Image processing applications
- Text analysis and mining projects`,
    tools: [
      {
        name: "General Text Recognition OCR",
        description:
          "Recognizes text in images across multiple scenarios and languages.",
      },
      {
        name: "English Word Segmentation",
        description: "Segments English text into individual words.",
      },
      {
        name: "Chinese Word Segmentation",
        description: "Segments Chinese text into words.",
      },
      {
        name: "Text Sentiment Analysis",
        description: "Analyzes sentiment and emotional tone of text.",
      },
      {
        name: "PDF to Image Conversion",
        description: "Converts PDF files to image format.",
      },
      {
        name: "Office to PDF Conversion",
        description: "Converts Office documents to PDF format.",
      },
      {
        name: "Image Background Removal",
        description: "Removes image backgrounds, preserving the main subject.",
      },
      {
        name: "Printed Text OCR",
        description:
          "Recognizes printed text content, supporting multiple languages.",
      },
      {
        name: "PDF Splitting and Merging",
        description: "Splits or merges PDF files.",
      },
      {
        name: "PDF Text Extraction",
        description: "Extracts text content from PDF files.",
      },
      {
        name: "Image to PDF Conversion",
        description: "Converts images to PDF files.",
      },
      {
        name: "Image Watermark Addition",
        description: "Adds text or image watermarks to images.",
      },
      {
        name: "Image Format Conversion",
        description: "Converts image formats, such as JPG to PNG.",
      },
    ],
  },
  {
    name: "Security",
    service_id: "security",
    short_description: "Identity verification and security services",
    long_description: `## Security Services

Protect your applications with comprehensive security and identity verification tools. Our APIs provide multi-layer authentication, fraud detection, and security intelligence to safeguard your digital assets.

### Key Features
- **Identity Verification**: Multi-element ID, phone, and bank card verification
- **Fraud Detection**: Advanced anomaly detection for IPs and accounts
- **Biometric Security**: Face liveness detection and real-person authentication
- **Business Verification**: Corporate identity and legal representative validation
- **Security Intelligence**: SSL certificates, DNS records, and breach monitoring

### Use Cases
- KYC (Know Your Customer) compliance
- Fraud prevention systems
- User authentication workflows
- Security monitoring and analysis
- Regulatory compliance solutions`,
    tools: [
      {
        name: "Anti-Fraud Detection",
        description:
          "Detects anomalous IPs and phone numbers, identifying malicious accounts.",
      },
      {
        name: "Operator Three-Element Verification",
        description:
          "Verifies consistency of name, ID number, and phone number.",
      },
      {
        name: "Operator Two-Element Verification",
        description: "Verifies consistency of name and phone number.",
      },
      {
        name: "ID Card Two-Element Verification",
        description: "Verifies consistency of name and ID number.",
      },
      {
        name: "Static Liveness Detection",
        description: "Determines if a face in an uploaded image is real.",
      },
      {
        name: "Real-Person Authentication",
        description:
          "Authenticates identity using name, ID number, and face photo comparison.",
      },
      {
        name: "Business Four-Element Verification",
        description:
          "Verifies consistency of business name, credit code, legal representative name, and ID.",
      },
      {
        name: "BIN/IP Fraud Check",
        description:
          "Verifies bank card details using BIN numbers to prevent fraudulent transactions.",
      },
      {
        name: "LeaksAPI Data Breach Check",
        description:
          "Checks if a user is involved in database or credential breaches.",
      },
      {
        name: "SSL Certificate Information Query",
        description:
          "Queries detailed information about a website’s SSL certificate.",
      },
      {
        name: "IP Whois Query",
        description:
          "Queries registration and ownership information for IP addresses.",
      },
      {
        name: "DNS Record Query",
        description: "Queries DNS record information for domains.",
      },
    ],
  },
  {
    name: "Audio & Video",
    service_id: "audio-video",
    short_description: "Multimedia processing and content analysis",
    long_description: `## Audio & Video Services

Transform and analyze multimedia content with our comprehensive audio and video processing tools. From format conversion to AI-powered analysis, our APIs handle all aspects of multimedia content management.

### Key Features
- **Content Download**: YouTube, Spotify, and social media content extraction
- **Format Conversion**: Audio and video format transformation
- **AI Analysis**: Speech recognition, emotion detection, and content tagging
- **Content Processing**: Subtitle generation, noise reduction, and enhancement
- **Advanced Features**: Speaker separation, keyframe extraction, and fingerprinting

### Use Cases
- Media streaming platforms
- Content creation and editing tools
- Podcast and audio analysis
- Video processing workflows
- AI-powered content moderation`,
    tools: [
      {
        name: "YouTube Video to MP3 Conversion",
        description: "Converts YouTube videos to MP3 format.",
      },
      {
        name: "Spotify Music Download",
        description:
          "Downloads and searches for songs and playlists on Spotify.",
      },
      {
        name: "YouTube Data Query",
        description: "Queries video, playlist, and channel data from YouTube.",
      },
      {
        name: "YouTube Video Download",
        description:
          "Downloads YouTube videos in various resolutions and formats.",
      },
      {
        name: "YouTube Transcription",
        description: "Transcribes YouTube podcasts and video content.",
      },
      {
        name: "Social Media Content Download",
        description:
          "Downloads videos, images, and audio from social media platforms.",
      },
      {
        name: "Video Subtitle Generation",
        description: "Generates subtitle files for videos.",
      },
      {
        name: "Speech to Text",
        description: "Converts audio or speech to text.",
      },
      {
        name: "Text to Speech",
        description: "Converts text to audio speech.",
      },
      {
        name: "Video to GIF Conversion",
        description: "Converts video clips to GIF format.",
      },
      {
        name: "Keyframe Extraction",
        description: "Extracts keyframe images from videos.",
      },
      {
        name: "Video Format Conversion",
        description: "Converts video formats, such as MP4 to AVI.",
      },
      {
        name: "Audio Emotion Recognition",
        description: "Analyzes emotional tone in audio.",
      },
      {
        name: "Audio Keyword Extraction",
        description: "Extracts keywords from audio content.",
      },
      {
        name: "Music Genre Tagging",
        description: "Generates genre tags for music, such as pop or rock.",
      },
      {
        name: "Sound Fingerprint Generation",
        description: "Generates unique fingerprints for audio.",
      },
      {
        name: "Video to Audio Extraction",
        description: "Extracts audio content from videos.",
      },
      {
        name: "Video Cover Image Extraction",
        description: "Extracts cover images from videos.",
      },
      {
        name: "Audio Format Conversion",
        description: "Converts audio formats, such as MP3 to WAV.",
      },
      {
        name: "Audio Noise Reduction",
        description: "Removes background noise from audio.",
      },
      {
        name: "Speech Sentiment Analysis",
        description: "Analyzes emotional state in speech.",
      },
      {
        name: "Speaker Separation",
        description: "Separates different speakers’ voices from audio.",
      },
    ],
  },
  {
    name: "Image & Vision",
    service_id: "image-vision",
    short_description: "Computer vision and image analysis services",
    long_description: `## Image & Vision Services

Leverage advanced computer vision technology for comprehensive image analysis and processing. Our APIs provide specialized OCR, object detection, and image enhancement capabilities for various industries.

### Key Features
- **Specialized OCR**: Bank cards, ID cards, license plates, and invoice recognition
- **Security Tools**: CAPTCHA generation and QR code creation
- **AI Vision**: Face detection, object recognition, and image analysis
- **Image Enhancement**: Super-resolution, style transfer, and quality improvement
- **Content Analysis**: Tag generation, similarity search, and tampering detection

### Use Cases
- Document digitization and automation
- Security and authentication systems
- E-commerce product recognition
- Content moderation and analysis
- Creative and artistic applications`,
    tools: [
      {
        name: "Bank Card OCR",
        description:
          "Recognizes bank card numbers, expiration dates, and other key fields.",
      },
      {
        name: "Vehicle License OCR",
        description:
          "Recognizes vehicle license details, including plate number and owner.",
      },
      {
        name: "ID Card OCR",
        description:
          "Recognizes text information from ID cards, including name and number.",
      },
      {
        name: "QR Code OCR",
        description:
          "Detects and recognizes QR code and barcode content in images.",
      },
      {
        name: "License Plate OCR",
        description: "Recognizes various Chinese license plate types.",
      },
      {
        name: "VAT Invoice OCR",
        description: "Recognizes key fields in VAT invoices.",
      },
      {
        name: "Four-Digit CAPTCHA Generation",
        description:
          "Generates four-digit CAPTCHA images with various character combinations.",
      },
      {
        name: "Six-Digit CAPTCHA Generation",
        description:
          "Generates six-digit CAPTCHA images with various character combinations.",
      },
      {
        name: "QR Code Generator",
        description: "Generates standard or artistic QR codes.",
      },
      {
        name: "Face Detection",
        description:
          "Detects face positions and returns keypoint coordinates in images.",
      },
      {
        name: "Real-Time Image Search",
        description: "Performs real-time image searches on Google Images.",
      },
      {
        name: "Object Detection",
        description:
          "Detects objects in images and returns their positions and categories.",
      },
      {
        name: "Image Style Transfer",
        description: "Converts images to specified artistic styles.",
      },
      {
        name: "Image Super-Resolution",
        description: "Enhances image resolution and clarity.",
      },
      {
        name: "Dominant Color Extraction",
        description: "Extracts the dominant color information from images.",
      },
      {
        name: "Image Tag Generation",
        description: "Generates descriptive tags for images.",
      },
      {
        name: "Image Similarity Search",
        description: "Searches for images similar to the input image.",
      },
      {
        name: "Image Tampering Detection",
        description: "Detects if an image has been tampered with or forged.",
      },
    ],
  },
  {
    name: "Sports & Fitness",
    service_id: "sports-fitness",
    short_description: "Sports data and fitness tracking services",
    long_description: `## Sports & Fitness Services

Access comprehensive sports data and fitness information from professional leagues and fitness databases. Our APIs provide real-time scores, statistics, and exercise data for sports applications and fitness platforms.

### Key Features
- **Multi-Sport Coverage**: Soccer, basketball, tennis, cricket, golf, and more
- **Real-time Data**: Live scores, odds, and match statistics
- **Betting Intelligence**: Sportsbook odds and betting analytics
- **Fitness Database**: 1300+ exercises with animated demonstrations
- **Professional Leagues**: Coverage of major sports leagues worldwide

### Use Cases
- Sports betting and fantasy platforms
- Fitness and workout applications
- Sports news and media websites
- Athletic performance analysis
- Sports data visualization tools`,
    tools: [
      {
        name: "API-FOOTBALL Soccer Data",
        description:
          "Provides real-time scores, odds, and stats for 180+ soccer leagues.",
      },
      {
        name: "TheRundown Sports Betting Data",
        description:
          "Provides real-time betting odds, scores, schedules, and stats.",
      },
      {
        name: "Sofascore Sports Data",
        description:
          "Provides real-time scores and stats for soccer and 20+ other sports.",
      },
      {
        name: "Tennis API",
        description:
          "Provides schedules, real-time results, and stats for ATP, WTA, and ITF matches.",
      },
      {
        name: "WNBA Basketball Data",
        description: "Provides scores, stats, and rankings for WNBA.",
      },
      {
        name: "Cricbuzz Cricket Data",
        description:
          "Provides real-time cricket scores, news, schedules, and stats.",
      },
      {
        name: "Real-Time Golf Data",
        description:
          "Provides real-time rankings and scorecards for PGA and LIV tours.",
      },
      {
        name: "Sportsbook Betting Data",
        description:
          "Provides latest odds from 10 US sportsbooks across 20 sports leagues.",
      },
      {
        name: "ExerciseDB Fitness Data",
        description:
          "Provides data and animated demos for 1300+ fitness exercises.",
      },
    ],
  },
  {
    name: "Entertainment",
    service_id: "entertainment",
    short_description: "Entertainment content and media information",
    long_description: `## Entertainment Services

Discover and analyze entertainment content with our comprehensive media information APIs. From movie ratings to recipe databases, our services provide rich content data for entertainment platforms.

### Key Features
- **Recipe Database**: Nutritional information and cost estimates with natural language queries
- **Movie & TV Data**: Ratings from IMDb, Metacritic, and Rotten Tomatoes
- **Streaming Intelligence**: Content availability across Netflix, Prime, and other platforms
- **Gaming Content**: Twitch channel and live stream data extraction
- **Global Coverage**: Entertainment data from 60+ countries

### Use Cases
- Entertainment recommendation engines
- Recipe and cooking applications
- Streaming platform aggregators
- Gaming and esports platforms
- Content discovery and curation tools`,
    tools: [
      {
        name: "Recipe and Nutrition Query",
        description:
          "Provides nutritional info, cost estimates, and recipes, supports natural language queries.",
      },
      {
        name: "Movie Rating Query",
        description:
          "Retrieves movie and TV show ratings from IMDb, Metacritic, and Rotten Tomatoes.",
      },
      {
        name: "Streaming Availability Query",
        description:
          "Queries program availability on Netflix, Prime, and other platforms in 60 countries.",
      },
      {
        name: "Twitch Data Scraping",
        description: "Scrapes channel and live stream data from Twitch.",
      },
    ],
  },
  {
    name: "Art",
    service_id: "art",
    short_description: "Creative and artistic tools and resources",
    long_description: `## Art Services

Explore creative possibilities with our art and design focused APIs. While currently in development, this category will provide comprehensive tools for artists, designers, and creative professionals.

### Key Features
- **Creative Tools**: Specialized APIs for artistic creation and design
- **Art Analysis**: Image style recognition and artistic content analysis
- **Design Resources**: Templates, assets, and creative inspiration tools
- **Collaboration**: Tools for creative team collaboration and workflow
- **Portfolio Management**: Artist portfolio and gallery management systems

### Use Cases
- Digital art creation platforms
- Design collaboration tools
- Art marketplace applications
- Creative portfolio websites
- Educational art platforms

*Note: This category is currently under development. More tools will be available soon.*`,
    tools: [
      {
        name: "None",
        description: "No relevant APIs.",
      },
    ],
  },
  {
    name: "Business",
    service_id: "business",
    short_description: "Business intelligence and market research tools",
    long_description: `## Business Services

Empower your business decisions with comprehensive market intelligence and business data APIs. From e-commerce analytics to recruitment tools, our services provide the insights you need to succeed.

### Key Features
- **E-commerce Intelligence**: Amazon, Taobao product and pricing data
- **Web Analytics**: Website traffic, engagement, and SEO metrics
- **Market Research**: Keyword insights and competitive analysis
- **Lead Generation**: Contact information and email discovery tools
- **Recruitment Data**: Job listings and recruiter information

### Use Cases
- E-commerce price monitoring
- Digital marketing optimization
- Lead generation and sales
- Competitive intelligence gathering
- Recruitment and HR platforms`,
    tools: [
      {
        name: "Axesso Amazon Data Query",
        description:
          "Provides real-time data on Amazon product titles, prices, and reviews.",
      },
      {
        name: "Open Taobao Data Query",
        description: "Provides product and store data from Taobao and Tmall.",
      },
      {
        name: "Similarweb Website Analytics",
        description:
          "Provides website traffic, engagement, and keyword ranking data.",
      },
      {
        name: "Google Keyword Insights",
        description:
          "Provides keyword suggestions, search volume, and SEO metrics.",
      },
      {
        name: "Website Contact Scraping",
        description:
          "Extracts emails, phone numbers, and social links from website domains.",
      },
      {
        name: "Email Finder",
        description: "Finds email addresses by name and domain.",
      },
      {
        name: "Active Job Database Query",
        description:
          "Retrieves job listings from career sites, filterable by location and description.",
      },
      {
        name: "Recruiter Information Query",
        description:
          "Retrieves LinkedIn profiles and emails related to job postings.",
      },
      {
        name: "Ad Library Query",
        description: "Queries social media platform ad data.",
      },
      {
        name: "TecDoc Auto Parts Query",
        description: "Provides auto parts catalog data.",
      },
      {
        name: "Large Product Data Query",
        description: "Provides UPC, GTIN, EAN barcode data for 965M+ products.",
      },
    ],
  },
  {
    name: "Others",
    service_id: "others",
    short_description: "Miscellaneous utilities and specialized services",
    long_description: `## Other Services

Discover additional specialized tools and utilities that don't fit into traditional categories. From web search to aviation data, these APIs provide unique functionality for diverse applications.

### Key Features
- **Web Search**: Real-time Google search results with geolocation support
- **News Intelligence**: Headlines and thematic news from Google News
- **Domain Analysis**: Authority metrics and backlink analysis
- **Aviation Data**: Flight information and aviation-related services
- **Travel Services**: Airbnb accommodation search and booking data

### Use Cases
- Search engine integration
- News aggregation platforms
- SEO and domain analysis tools
- Travel booking applications
- Specialized data collection projects`,
    tools: [
      {
        name: "Real-Time Web Search",
        description:
          "Provides Google web search results, supports geolocation.",
      },
      {
        name: "Google Comprehensive Search",
        description:
          "Provides Google search APIs for web, images, videos, and news.",
      },
      {
        name: "Real-Time News Data Query",
        description:
          "Retrieves headlines, thematic, or local news from Google News.",
      },
      {
        name: "Domain Authority Check",
        description: "Checks domain DR, DA, PA, and backlink metrics.",
      },
      {
        name: "AeroDataBox Aviation Data",
        description: "Provides flight and aviation-related data.",
      },
      {
        name: "Airbnb Accommodation Search",
        description:
          "Searches Airbnb rental locations by place or coordinates.",
      },
      {
        name: "TradingView Financial Data",
        description:
          "Provides real-time data for stocks, futures, forex, and cryptocurrencies.",
      },
    ],
  },
];
