import About from '../models/About.js';

export const seedAboutContent = async () => {
  try {
    // Check if about content already exists
    const existingContent = await About.findOne();
    
    if (!existingContent) {
      console.log('Seeding default about content...');
      
      const defaultContent = {
        introduction: 'நாம் இன்று பயணிக்கும் தெருக்களில், நாளை நம் சுவடுகள் அனைத்தையும் மரணம் தடயங்களில்லாது வாரிக் கொண்டுபோய்விடும் என்று எப்போதாவது யோசித்திருக்கின்றீர்களா? அந்த நினைப்பே என்னைக் கலங்க வைத்திருக்கிறது. இவ்வளவுதானா வாழ்வு என்று இடம் பொருள் ஏவல் அனைத்தையும் துறந்து பயமுறுத்தியிருக்கிறது. கலக்கத்தை மீறி அதுதான் வாழ்வின் அழகே என்று சிலிர்த்தெழுந்து, பலவீனங்களுடன் மனிதர்களை இன்னும் நேசிக்க வைக்கிறது. மனிதர்களை எந்தளவுக்கு நேசிக்கின்றேனோ, அந்தவளவுக்கு மனிதர்களிடம் இருந்து விலகி இருக்கவே விரும்புகின்றேன்.',
        biography: 'ஈழத்தில் யாழ்ப்பாணம் அம்பனையில் பிறந்த நான் உள்நாட்டு யுத்தம் நிமித்தம் எனது பதினாறாவது வயதில் கனடாவுக்குப் புலம்பெயர்ந்து தற்போது ரொறொண்டோவில் வசித்து வருகின்றேன். கவிதைகள், சிறுகதைகள், நாவல்கள் தவிர, \'டிசே தமிழன்\' என்னும் பெயரில் கட்டுரைகளும், விமர்சனங்களும், பத்திகளும் பல்வேறு இதழ்களிலும், இணையத்தளங்களிலும் எழுதி வருகின்றேன்.',
        interests: 'எழுதுவதைப் போலவே வாசிப்பிலும், பயணங்கள் செய்வதிலும் ஆர்வமுள்ளவன். பயணங்களிலும், வாசிப்பிலும், விரியும் உலகம் என்பது நான் இதுவரை கற்பனை செய்திராத வாழ்க்கையும் மனிதர்களையும் எனக்கு அறிமுகம் செய்திருக்கின்றது. இவற்றின் ஊடாகவே என் நாளாந்த வாழ்வின் த த்தளிப்புக்களையும், சலிப்புக்களையும் தாண்டி வந்தபடி இருக்கின்றேன்.',
        books: [
          'நாடற்றவனின் குறிப்புகள் (2007) - கவிதைகள்',
          'சாம்பல் வானத்தில் மறையும் வைரவர் (2012) - சிறுகதைகள்',
          'பேயாய் உழலும் சிறுமனமே (2016) - கட்டுரைகள்',
          'மெக்ஸிக்கோ (2019) - நாவல்',
          'உதிரும் நினைவின் வர்ணங்கள் (2020) – திரைப்படக்கட்டுரைகள்',
          'சார்ள்ஸ் ப்யூகோவ்ஸ்கி கவிதைகள் (2021) – மொழிபெயர்ப்பு',
          'தாய்லாந்து (2022) – குறுநாவல்',
          'நானுன்னை முத்தமிடுகையில் புத்தர் சிரித்துக்கொண்டிருந்தார் (2025) - சிறுகதைகள்'
        ],
        awards: '\'மெக்ஸிக்கோ\' நாவல் பிரபஞ்சன் நினைவு நாவல் போட்டியில் 2019 -இல் பரிசையும், \'நாடற்றவனின் குறிப்புகள்\' தமிழ்நாடு கலை இலக்கியப் பெருமன்றத்தின் \'ஏலாதி\' இலக்கிய விருதை 2008 -இலும் பெற்றிருக்கிறது.',
        authorName: 'எழுத்தாளர் இளங்கோ',
        authorTitle: 'Writer Elanko-Dse | தமிழ் இலக்கியம், கட்டுரைகள், விமர்சனங்கள்',
        email: 'elanko@rogers.com',
        phone: '+1 (416) 123-4567',
        website: 'www.elanko-dse.com',
        address: 'Toronto, Canada',
        socialMedia: {
          facebook: 'https://facebook.com/elankodse',
          twitter: 'https://twitter.com/elankodse',
          instagram: 'https://instagram.com/elankodse'
        },
        contactLabel: 'தொடர்புகட்கு:'
      };
      
      await About.create(defaultContent);
      console.log('Default about content seeded successfully');
    } else {
      console.log('About content already exists, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding about content:', error);
  }
};
