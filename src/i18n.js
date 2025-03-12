import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      "nav.realtime": "Realtime Data",
      "nav.learn": "Learn",
      "nav.tools": "Tools",
      "nav.volunteer": "Volunteer",
      "nav.disasterCatalogue": "Disaster Catalogue",
      "nav.aiChatbot": "AI Chatbot",
      "nav.responseManagement": "Response Management",
      "nav.missingPersonRegistry": "Missing Person Registry",
      "nav.sos": "SOS",
      "nav.login": "Login",
      "nav.profile": "Profile",
      "nav.logout": "Logout",
      "InfoUnity Response": "InfoUnity Response",
      "Uniting Information, Empowering Response":
        "Uniting Information, Empowering Response",
      "Search divisional secretariats...": "Search divisional secretariats...",
      "Weather and Response Status in": "Weather and Response Status in",
      "Warning Level": "Warning Level",
      "Safety Status": "Safety Status",
      "Volunteer Need": "Volunteer Need",
      Safe: "Safe",
      "Not Safe": "Not Safe",
      Required: "Required",
      "Not Required": "Not Required",
      "High Risk": "High Risk",
      "Medium Risk": "Medium Risk",
      "Low Risk": "Low Risk",
      "Loading...": "Loading...",
      // Info Unity Section
      "section.information.title": "Information",
      "section.information.description":
        "Provide accurate, real-time information during disasters. Achieved through real-time mapping, AI chatbot, and disaster catalogue.",
      "section.unity.title": "Unity",
      "section.unity.description":
        "Unite communities, volunteers, and authorities in disaster response efforts. Facilitated by volunteer management, missing person registry, and resource allocation features.",
      "section.response.title": "Response",
      "section.response.description":
        "Enable swift, coordinated response to minimize disaster impact. Facilitated by volunteer management, missing person registry, and resource allocation features.",
      "section.whatFor": "WHAT ARE YOU HERE FOR?",
      "button.reportDisaster": "Report a Disaster",

      // Action Buttons
      "action.realtimeMaps": "Realtime Maps",
      "action.supportChatbot": "Support Chatbot",
      "action.volunteer": "Volunteer",
      "action.missingRegistry": "Missing Person Registry",
      "action.resources": "Resource Allocation",
      "action.donate": "Donate",

      // Who Are We Section
      "whoWeAre.title": "WHO WE ARE AT INFO UNITY RESPONSE ?",
      "whoWeAre.partnership": "In Partnership With",

      // Emergency Response Grid
      "emergency.stayInformed": "STAY INFORMED",
      "emergency.drought": "RESPONSE TO DROUGHTS",
      "emergency.tsunami": "RESPONSE TO TSUNAMIS",
      "emergency.flood": "RESPONSE TO RAIN / FLOOD",
      "emergency.landslide": "RESPONSE TO LANDSLIDES",

      // Latest Updates Section
      "updates.latestUpdates": "LATEST UPDATES",
      "updates.scrollLeft": "Scroll left",
      "updates.scrollRight": "Scroll right",
      "updates.untitledUpdate": "Untitled Update",
      "updates.noDescription": "No description provided",
      "updates.unknownLocation": "Location unknown",
      "updates.statusPending": "Pending",
      "updates.anonymous": "Anonymous",
      "updates.magnitude": "Magnitude",
      "updates.casualties": "Casualties",
      "updates.damageLevel": "Damage Level",
      "updates.evacuationStatus": "Evacuation Status",
      "updates.createdBy": "Created by",

      // Status translations
      "updates.status.approved": "Approved",
      "updates.status.pending": "Pending",
      "updates.status.rejected": "Rejected",

      // Damage level translations
      "updates.damageLevels.severe": "Severe",
      "updates.damageLevels.moderate": "Moderate",
      "updates.damageLevels.minor": "Minor",

      // Evacuation status translations
      "updates.evacuationStatuses.required": "Required",
      "updates.evacuationStatuses.recommended": "Recommended",
      "updates.evacuationStatuses.notRequired": "Not Required",

      //Info Section Accordian
      "logo.alt": "InfoUnity Response Logo",
      "logo.partner1": "Red Cross Logo",
      "logo.partner2": "DMC Logo",
      "whoWeAre.vision.title":
        "What is the overarching vision of InfoUnity Response?",
      "whoWeAre.vision.content":
        "InfoUnity Response envisions a future where communities are resilient in the face of disasters, empowered by seamless access to critical information and resources. We aim to revolutionize disaster management by creating a unified platform that bridges the gap between those affected by disasters and those responding to them. Our vision is to minimize the impact of disasters on human lives and livelihoods by leveraging cutting-edge technology to enable rapid, coordinated, and effective responses. Ultimately, we see InfoUnity Response as a catalyst for building more prepared, connected, and resilient communities worldwide.",
      "whoWeAre.mission.title":
        "How does InfoUnity Response's mission align with its technological operation?",
      "whoWeAre.mission.content":
        "InfoUnity Response's mission is to provide a comprehensive, user-friendly platform that unifies disaster-related information, coordinates response efforts, and empowers communities to act swiftly and effectively during crises. This mission aligns perfectly with our technological approach of creating a Progressive Web Application (PWA) that's accessible across devices and network conditions. By leveraging technologies like React for a responsive interface, Firebase for real-time data synchronization and push notifications, and AI for predictive analysis and chatbot interactions, we ensure that our platform is not only technologically advanced but also highly practical and user-centric. Our use of multilingual support further reinforces our mission to make critical information accessible to all, regardless of language barriers.",
      "whoWeAre.brand.title":
        "What does the InfoUnity Response brand represent?",
      "whoWeAre.brand.content":
        "The InfoUnity Response brand represents trust, innovation, and community empowerment in the face of adversity. Our brand embodies the idea that when information and people are united, we can respond more effectively to any challenge. This is reflected in our application through features like real-time disaster mapping, which showcases our commitment to providing trustworthy, up-to-date information. The volunteer management system exemplifies our focus on community empowerment, while the AI-powered chatbot demonstrates our innovative approach to problem-solving. The clean, intuitive interface of our app, combined with its robust functionality, reinforces our brand image as a reliable, cutting-edge solution for disaster management. Even our color scheme, predominantly using calming blues and energetic greens, is chosen to evoke a sense of trust and hope during challenging times.",
      "whoWeAre.responsibilities.title":
        "What are the key responsibilities and duties?",
      "whoWeAre.responsibilities.content":
        "InfoUnity Response holds a significant responsibility towards its users and the communities it serves. Our primary duty is to ensure the accuracy and timeliness of the information we provide, as lives may depend on it during disasters. We have a responsibility to maintain the highest standards of data privacy and security, protecting sensitive information about affected individuals and responders. It's our duty to ensure the platform remains accessible and functional even under extreme conditions, which we achieve through offline capabilities and low-bandwidth optimizations. We are also responsible for fostering cooperation between various stakeholders - from individual volunteers to government agencies - to ensure a coordinated response. Additionally, we have a duty to continually improve our platform based on user feedback and evolving disaster management best practices, ensuring that InfoUnity Response remains an effective tool for saving lives and minimizing disaster impacts.",
      "whoWeAre.technology.title":
        "How does InfoUnity Response leverage technology?",
      "whoWeAre.technology.content":
        "InfoUnity Response stays at the forefront of disaster management by strategically leveraging cutting-edge technologies. We utilize machine learning algorithms for disaster impact prediction and resource allocation, allowing for proactive rather than reactive responses. Our use of real-time data synchronization through Firebase ensures that all users have access to the most current information, critical in rapidly evolving disaster scenarios. The implementation of a Progressive Web App architecture allows our platform to function effectively even in low-connectivity areas often encountered during disasters. We incorporate AI-driven chatbots to provide immediate, contextual assistance to users, and employ geospatial technologies for accurate mapping and location-based services. By continuously exploring emerging technologies like improved natural language processing, advanced data analytics, and potentially augmented reality for on-ground assistance, we ensure that InfoUnity Response remains a technological leader in the disaster management field.",

      //Login
      "logo.alt": "Logo",
      email: "Email",
      password: "Password",
      as: "as",
      dontHaveAccount: "Don't have an account?",
      register: "Register",

      registerAsRespondent: "Register as a Respondent",
      nicNumber: "NIC Number",
      fullName: "Full Name",
      mobileNumber: "Mobile Number",
      email: "Email",
      password: "Password",
      registrationFailed: "Registration failed. Please try again.",
      nicValidationError: "NIC must be 12 or 13 alphanumeric characters.",
      mobileValidationError: "Mobile number must be 9 digits.",
      alreadyHaveAccount: "Already have an account?",
      login: "Login",
      register: "Register",
      registerAsVolunteer: "Register as a Volunteer",
      nicNumber: "NIC Number",
      fullName: "Full Name",
      mobileNumber: "Mobile Number",
      alreadyHaveAccount: "Already have an account?",

      locationValidationError: "District and Division are required.",
      nicValidationError:
        "NIC number must be alphanumeric and between 1 to 13 characters.",
      mobileValidationError: "Mobile number must be exactly 9 digits.",
      emailValidationError: "Invalid email format.",
      passwordValidationError: "Password must be at least 6 characters long.",
      redCrossVolunteer: "Are you a Red Cross Volunteer?",

      //Register
      "disasterCategories": "Disaster Categories",
      "Emergency Response": "Emergency Response",
      "Search and Rescue (SAR)": "Search and Rescue (SAR)",
      "Medical Assistance": "Medical Assistance",
      "Firefighting Support": "Firefighting Support",
      "Evacuation Assistance": "Evacuation Assistance",
      "Damage Assessment": "Damage Assessment",
      "Relief and Humanitarian Aid": "Relief and Humanitarian Aid",
      "Food Distribution": "Food Distribution",
      "Shelter Assistance": "Shelter Assistance",
      "Clothing & Supplies Distribution": "Clothing & Supplies Distribution",
      "Water, Sanitation, and Hygiene (WASH) Support": "Water, Sanitation, and Hygiene (WASH) Support",
      "Psychosocial Support": "Psychosocial Support",
      "Counseling and Psychological First Aid": "Counseling and Psychological First Aid",
      "Childcare & Education": "Childcare & Education",
      "Community Support": "Community Support",
      "Technical Support": "Technical Support",
      "Communication & IT Support": "Communication & IT Support",
      "Transportation & Logistics": "Transportation & Logistics",
      "GIS & Mapping": "GIS & Mapping",
      "Recovery & Reconstruction": "Recovery & Reconstruction",
      "Debris Removal & Cleanup": "Debris Removal & Cleanup",
      "Rebuilding Infrastructure": "Rebuilding Infrastructure",
      "Livelihood Restoration": "Livelihood Restoration",
      "Disaster Preparedness": "Disaster Preparedness",
      "Community Training & Drills": "Community Training & Drills",
      "Animal Rescue": "Animal Rescue",
      "Animal Evacuation & Shelter": "Animal Evacuation & Shelter",
      "Wildlife Conservation": "Wildlife Conservation",
      "searchDisasterCategories": "Search disaster categories..."

    },
  },
  si: {
    translation: {
      "InfoUnity Response": "තොරතුරු සමගිය ප්රතිචාරය",
      "logo.alt": "තොරතුරු සමගිය ලාංඡනය",
      "nav.realtime": "තත්‍ය කාලීන දත්ත",
      "nav.learn": "ඉගෙන ගන්න",
      "nav.tools": "මෙවලම්",
      "nav.volunteer": "ස්වේච්ඡා",
      "nav.disasterCatalogue": "ආපදා නාමාවලිය",
      "nav.aiChatbot": "AI චැට්බෝට්",
      "nav.responseManagement": "ප්‍රතිචාර කළමනාකරණය",
      "nav.missingPersonRegistry": "අතුරුදහන් වූ පුද්ගල ලේඛනය",
      "nav.sos": "හදිසි ඇමතුම",
      "nav.login": "පිවිසෙන්න",
      "nav.profile": "පැතිකඩ",
      "Comprehensive Disaster Response Platform":
        "සම්පූර්ණ ආපදා ප්‍රතිචාර වේදිකාව",
      "A multi-featured web application designed to enhance disaster preparedness, response, and recovery efforts.":
        "ආපදා සූදානම් කිරීම, ප්‍රතිචාර සහ ප්‍රතිසංස්කරණ උත්සාහයන් ප්‍රවර්ධනය කිරීමට නිර්මාණය කළ බහු-විශේෂිත වෙබ් යෙදුමකි.",
      "Development in progress": "සංවර්ධනය වෙමින් පවතී",
      "Uniting Information, Empowering Response":
        "තොරතුරු එකතු කිරීම, බලගැන්වීමේ ප්‍රතිචාරය",
      "Search divisional secretariats...":
        "ප්‍රාදේශීය ලේකම් කොට්ඨාශ පරීක්ෂා කරන්න...",
      "Weather and Response Status in": "වෙත වැසි සහ ප්‍රතිචාර තත්ත්වය",
      "Warning Level": "අනතුරු හදුනාගැනීමේ මට්ටම",
      "Safety Status": "ආරක්ෂිත තත්ත්වය",
      "Volunteer Need": "ස්වේච්ඡා සේවක අවශ්‍යතා",
      Safe: "ආරක්ෂිතයි",
      "Not Safe": "අ ආරක්ෂිතයි",
      Required: "අවශ්‍යයි",
      "Not Required": "අවශ්‍ය නැත",
      "High Risk": "අධික අවදානම",
      "Medium Risk": "මධ්‍යම අවදානම",
      "Low Risk": "අඩු අවදානම",
      "Loading...": "පූරණය වෙමින්...",
      // Info Unity Section
      "section.information.title": "තොරතුරු",
      "section.information.description":
        "ආපදා අවස්ථාවලදී නිවැරදි, තත්කාලීන තොරතුරු සපයන්න. තත්කාලීන සිතියම්කරණය, AI චැට්බෝට් සහ ආපදා නාමාවලිය හරහා ලබා ගත හැකිය.",
      "section.unity.title": "සමගිය",
      "section.unity.description":
        "ආපදා ප්‍රතිචාර උත්සාහයන්හිදී ප්‍රජාවන්, ස්වේච්ඡා සේවකයින් සහ අධිකාරීන් එක්සත් කරන්න. ස්වේච්ඡා කළමනාකරණය, අතුරුදහන් පුද්ගල ලේඛනය සහ සම්පත් වෙන්කිරීමේ විශේෂාංග මගින් පහසුකම් සපයනු ලැබේ.",
      "section.response.title": "ප්‍රතිචාරය",
      "section.response.description":
        "ආපදා බලපෑම අවම කිරීම සඳහා ක්ෂණික, සම්බන්ධීකරණ ප්‍රතිචාරයක් සක්‍රීය කරන්න. ස්වේච්ඡා කළමනාකරණය, අතුරුදහන් පුද්ගල ලේඛනය සහ සම්පත් වෙන්කිරීමේ විශේෂාංග මගින් පහසුකම් සපයනු ලැබේ.",
      "section.whatFor": "ඔබ මෙහි සිටින්නේ කුමක් සඳහාද?",
      "button.reportDisaster": "ආපදාවක් වාර්තා කරන්න",

      // Action Buttons
      "action.realtimeMaps": "තත්කාලීන සිතියම්",
      "action.supportChatbot": "සහාය චැට්බෝට්",
      "action.volunteer": "ස්වේච්ඡා සේවය",
      "action.missingRegistry": "අතුරුදහන් පුද්ගල ලේඛනය",
      "action.resources": "සම්පත් වෙන්කිරීම",
      "action.donate": "පරිත්‍යාග",

      // Who Are We Section
      "whoWeAre.title": "තොරතුරු සමගිය ප්‍රතිචාරයෙහි අපි කවුද?",
      "whoWeAre.partnership": "හවුල්කාරිත්වය සමඟ",

      // Emergency Response Grid
      "emergency.stayInformed": "දැනුවත්ව සිටින්න",
      "emergency.drought": "නියඟයට ප්‍රතිචාර",
      "emergency.tsunami": "සුනාමියට ප්‍රතිචාර",
      "emergency.flood": "වැසි / ගංවතුරට ප්‍රතිචාර",
      "emergency.landslide": "නායයෑම්වලට ප්‍රතිචාර",
      // Latest Updates Section
      "updates.latestUpdates": "නවතම යාවත්කාලීන",
      "updates.scrollLeft": "වමට අනුචලනය කරන්න",
      "updates.scrollRight": "දකුණට අනුචලනය කරන්න",
      "updates.untitledUpdate": "නම් නොකළ යාවත්කාලීන",
      "updates.noDescription": "විස්තරයක් සපයා නැත",
      "updates.unknownLocation": "ස්ථානය නොදනී",
      "updates.statusPending": "විභාග වෙමින් පවතී",
      "updates.anonymous": "නිර්නාමික",
      "updates.magnitude": "ප්‍රමාණය",
      "updates.casualties": "හානි",
      "updates.damageLevel": "හානි මට්ටම",
      "updates.evacuationStatus": "ඉවත් කිරීමේ තත්ත්වය",
      "updates.createdBy": "නිර්මාණය කළේ",

      // Status translations
      "updates.status.approved": "අනුමත කරන ලදී",
      "updates.status.pending": "විභාග වෙමින් පවතී",
      "updates.status.rejected": "ප්‍රතික්ෂේප කරන ලදී",

      // Damage level translations
      "updates.damageLevels.severe": "දරුණු",
      "updates.damageLevels.moderate": "මධ්‍යස්ථ",
      "updates.damageLevels.minor": "සුළු",

      // Evacuation status translations
      "updates.evacuationStatuses.required": "අවශ්‍යයි",
      "updates.evacuationStatuses.recommended": "නිර්දේශිතයි",
      "updates.evacuationStatuses.notRequired": "අවශ්‍ය නැත",

      "logo.alt": "තොරතුරු සමගිය ලාංඡනය",
      "logo.partner1": "රතු කුරුස ලාංඡනය",
      "logo.partner2": "ආපදා කළමනාකරණ මධ්යස්ථාන ලාංඡනය",
      "whoWeAre.vision.title": "තොරතුරු සමගිය ප්‍රතිචාරයේ පුළුල් දැක්ම කුමක්ද?",
      "whoWeAre.vision.content":
        "තොරතුරු සමගිය ප්‍රතිචාරය දකින්නේ ප්‍රජාවන් ආපදාවලට මුහුණ දීමේදී ඔරොත්තු දෙන, වැදගත් තොරතුරු සහ සම්පත් වෙත නිදහස් ප්‍රවේශය මගින් සවිබල ගැන්වූ අනාගතයකි. ආපදාවලින් පීඩාවට පත් වූවන් සහ ඒවාට ප්‍රතිචාර දක්වන්නන් අතර පවතින පරතරය පියවීම සඳහා ඒකාබද්ධ වේදිකාවක් නිර්මාණය කිරීම මගින් ආපදා කළමනාකරණය විප්ලවීය කිරීමට අපි අදහස් කරමු. ශීඝ්‍ර, සම්බන්ධීකරණය කළ සහ සඵලදායී ප්‍රතිචාර සක්‍රීය කිරීම සඳහා නවීනතම තාක්ෂණය භාවිතා කිරීමෙන් මිනිස් ජීවිත සහ ජීවනෝපායන් කෙරෙහි ආපදාවල බලපෑම අවම කිරීම අපගේ දැක්මයි. අවසාන වශයෙන්, ලෝකය පුරා වඩාත් සූදානම් වූ, සම්බන්ධිත සහ ප්‍රත්‍යාස්ථිතික ප්‍රජාවන් ගොඩනැගීම සඳහා උත්ප්‍රේරකයක් ලෙස තොරතුරු සමගිය ප්‍රතිචාරය අපි දකිමු.",
      "whoWeAre.mission.title":
        "තොරතුරු සමගිය ප්‍රතිචාරයේ මෙහෙවර එහි තාක්ෂණික ක්‍රියාකාරිත්වය සමඟ කෙසේ ගැලපේද?",
      "whoWeAre.mission.content":
        "තොරතුරු සමගිය ප්‍රතිචාරයේ මෙහෙවර වන්නේ ආපදා සම්බන්ධ තොරතුරු ඒකාබද්ධ කරන, ප්‍රතිචාර උත්සාහයන් සම්බන්ධීකරණය කරන සහ අර්බුද අවස්ථාවලදී ශීඝ්‍රව සහ සඵලදායීව ක්‍රියා කිරීමට ප්‍රජාවන්ට බලය ලබා දෙන සර්වග්‍රාහී, පරිශීලක හිතකාමී වේදිකාවක් සැපයීමයි. මෙම මෙහෙවර උපකරණ සහ ජාල තත්ත්වයන් හරහා ප්‍රවේශ විය හැකි ප්‍රගතිශීලී වෙබ් යෙදුමක් (PWA) නිර්මාණය කිරීමේ අපගේ තාක්ෂණික ප්‍රවේශය සමඟ පරිපූර්ණව ගැලපේ. ප්‍රතිචාරාත්මක අතුරු මුහුණතක් සඳහා React, තත්‍ය කාලීන දත්ත සමමුහුර්තකරණය සහ තල්ලු දැනුම්දීම් සඳහා Firebase සහ පුරෝකථන විශ්ලේෂණය සහ චැට්බොට් අන්තර්ක්‍රියා සඳහා AI වැනි තාක්ෂණයන් භාවිතා කිරීමෙන්, අපගේ වේදිකාව තාක්ෂණිකව දියුණු පමණක් නොව ඉතා ප්‍රායෝගික සහ පරිශීලක කේන්ද්‍රීය බවට අපි සහතික කරමු. භාෂා බාධක නොසලකා වැදගත් තොරතුරු සියල්ලන්ට ප්‍රවේශ විය හැකි කිරීමේ අපගේ මෙහෙවර බහුභාෂා සහාය භාවිතය තවදුරටත් ශක්තිමත් කරයි.",
      "whoWeAre.brand.title":
        "තොරතුරු සමගිය ප්‍රතිචාර වෙළඳ නාමය නියෝජනය කරන්නේ කුමක්ද?",
      "whoWeAre.brand.content":
        "තොරතුරු සමගිය ප්‍රතිචාර වෙළඳ නාමය අභියෝග හමුවේ විශ්වාසය, නවෝත්පාදනය සහ ප්‍රජා සවිබල ගැන්වීම නියෝජනය කරයි. තොරතුරු සහ මිනිසුන් එක්වූ විට ඕනෑම අභියෝගයකට වඩාත් සඵලදායීව ප්‍රතිචාර දැක්විය හැකි බව අපගේ වෙළඳ නාමය පෙන්නුම් කරයි. විශ්වාසනීය, යාවත්කාලීන තොරතුරු සැපයීමට අපගේ කැපවීම පෙන්නුම් කරන තත්‍ය කාලීන ආපදා සිතියම්කරණය වැනි විශේෂාංග හරහා මෙය අපගේ යෙදුමේ පිළිබිඹු වේ. AI-බලගැන්වූ චැට්බොට් අපගේ ගැටලු විසඳීමේ නවෝත්පාදන ප්‍රවේශය පෙන්නුම් කරන අතර, ස්වේච්ඡා කළමනාකරණ පද්ධතිය ප්‍රජා සවිබල ගැන්වීම කෙරෙහි අපගේ අවධානය පෙන්නුම් කරයි. අපගේ යෙදුමේ පිරිසිදු, සහජ අතුරු මුහුණත එහි ශක්තිමත් ක්‍රියාකාරිත්වය සමඟ එක්ව, ආපදා කළමනාකරණය සඳහා විශ්වසනීය, නවීනතම විසඳුමක් ලෙස අපගේ වෙළඳ නාම චිත්‍රය ශක්තිමත් කරයි.",
      "whoWeAre.responsibilities.title": "ප්‍රධාන වගකීම් සහ යුතුකම් මොනවාද?",
      "whoWeAre.responsibilities.content":
        "තොරතුරු සමගිය ප්‍රතිචාරය එහි පරිශීලකයින් සහ සේවය කරන ප්‍රජාවන් වෙත සැලකිය යුතු වගකීමක් දරයි. ආපදා අවස්ථාවලදී ජීවිත එය මත රඳා පවතින බැවින් අප සපයන තොරතුරුවල නිරවද්‍යතාව සහ කාලෝචිත බව සහතික කිරීම අපගේ ප්‍රාථමික යුතුකමයි. බලපෑමට ලක්වූ පුද්ගලයින් සහ ප්‍රතිචාර දක්වන්නන් පිළිබඳ සංවේදී තොරතුරු ආරක්ෂා කිරීමෙන් දත්ත රහස්‍යතාව සහ ආරක්ෂාව පිළිබඳ ඉහළම ප්‍රමිතීන් පවත්වා ගැනීමේ වගකීමක් අපට ඇත. අන්තර්ජාල නොමැති හැකියාවන් සහ අඩු කලාප ප්‍රශස්තකරණයන් හරහා අතිශය තත්ත්වයන් යටතේ පවා වේදිකාව ප්‍රවේශ්‍ය සහ ක්‍රියාකාරී ව පවත්වා ගැනීම අපගේ යුතුකමයි.",
      "whoWeAre.technology.title":
        "තොරතුරු සමගිය ප්‍රතිචාරය තාක්ෂණය උපයෝගී කර ගන්නේ කෙසේද?",
      "whoWeAre.technology.content":
        "තොරතුරු සමගිය ප්‍රතිචාරය නවීනතම තාක්ෂණයන් උපායශීලීව භාවිතා කිරීමෙන් ආපදා කළමනාකරණයේ පෙරමුණේ සිටියි. ප්‍රතිචාරාත්මක වෙනුවට පුරෝක්‍රියාකාරී ප්‍රතිචාර සඳහා ඉඩ සලසමින්, ආපදා බලපෑම් පුරෝකථනය සහ සම්පත් වෙන්කිරීම සඳහා අපි යන්ත්‍ර ඉගෙනුම් ඇල්ගොරිතම භාවිතා කරමු. Firebase හරහා තත්‍ය කාලීන දත්ත සමමුහුර්තකරණය භාවිතා කිරීම මගින් සියලුම පරිශීලකයින්ට නවතම තොරතුරු වෙත ප්‍රවේශය ඇති බව සහතික කරයි. ප්‍රගතිශීලී වෙබ් යෙදුම් නිර්මාණ ශිල්පය ක්‍රියාත්මක කිරීම මගින් ආපදා අවස්ථාවලදී නිතර මුහුණ දෙන අඩු සම්බන්ධතා ප්‍රදේශවලදී පවා අපගේ වේදිකාව සඵලදායීව ක්‍රියා කිරීමට ඉඩ සලසයි.",

      "logo.alt": "තොරතුරු සමගිය ලාංඡනය",
      email: "ඊ-මේල්",
      password: "රහස් පදය",
      as: "විධායකය ලෙස",
      dontHaveAccount: "ගිණුමක් නැද්ද?",
      register: "ලියාපදිංචි වන්න",

      registerAsRespondent: "ප්‍රතිචාරකයෙක් ලෙස ලියාපදිංචි වන්න",
      nicNumber: "එන්.අයි.සී අංකය",
      fullName: "සම්පූර්ණ නම",
      mobileNumber: "ජංගම දුරකථන අංකය",
      registrationFailed: "ලියාපදිංචි කිරීම අසාර්ථකයි. කරුණාකර නැවත נסයන්න.",
      nicValidationError:
        "NIC අංකය 12 හෝ 13 අක්ෂර සහ සංඛ්‍යාත විශේෂාංග සමඟ විය යුතුයි.",
      mobileValidationError: "ජංගම දුරකථන අංකය 9 අංක වලින් පමණක් විය යුතුයි.",
      alreadyHaveAccount: "කැරැඳි ගිණුමක් ඇතිද?",
      login: "ඇතුල්වීම",
      registerAsVolunteer: "රැකියා තේරීම සඳහා ලියාපදිංචි වන්න",
      nicNumber: "එන්.අයි.සී අංකය",
      fullName: "සම්පූර්ණ නම",
      mobileNumber: "ජංගම දුරකථන අංකය",
      email: "ඊ-තැපැල්",
      password: "මුරපදය",

      alreadyHaveAccount: "කැරැඳි ගිණුමක් ඇතිද?",
      login: "ඇතුල්වීම",
      locationValidationError: "දිස්ත්‍රික්කය සහ වෙන්දේසිය අවශ්‍යයි.",
      nicValidationError:
        "NIC අංකය 12 හෝ 13 අක්ෂර සහ සංඛ්‍යාත විශේෂාංග සමඟ විය යුතුයි.",
      mobileValidationError: "ජංගම දුරකථන අංකය 9 අංක වලින් පමණක් විය යුතුයි.",
      emailValidationError: "ඊ-තැපැල් ආකෘතිය වැරදියි.",
      passwordValidationError: "මුරපදය අඩුම වශයෙන් 6 අක්ෂර විය යුතුයි.",
      redCrossVolunteer: "ඔබ රෙඩ් ක්‍රෝස් වල රැකියා කළමනාකරුද?",
      "disasterCategories": "ආපදා කාණ්ඩ",
      "searchDisasterCategories": "ආපදා කාණ්ඩ සොයන්න...",
      "Emergency Response": "හදිසි ප්‍රතිචාර",
      "Search and Rescue (SAR)": "සෙවීම් හා ගලවා ගැනීම (SAR)",
      "Medical Assistance": "සෞඛ්‍ය උපකාර",
      "Firefighting Support": "දහන නිවාරණ සහාය",
      "Evacuation Assistance": "ඉවත්වීමේ සහාය",
      "Damage Assessment": "හානි තක්සේරුව",
      "Relief and Humanitarian Aid": "සහන සහ මානවධර්ම ආධාර",
      "Food Distribution": "ආහාර බෙදාහැරීම",
      "Shelter Assistance": "නිවාස සහාය",
      "Clothing & Supplies Distribution": "ඇඳුම් සහ උපකරණ බෙදාහැරීම",
      "Water, Sanitation, and Hygiene (WASH) Support": "ජලය, සනීපාරක්ෂාව සහ සෞඛ්‍ය (WASH) සහාය",
      "Psychosocial Support": "මනෝසමාජ සහාය",
      "Counseling and Psychological First Aid": "සමාලෝචන සහ මනෝවේදී ප්‍රථමාධාර",
      "Childcare & Education": "ළමා රැකවරණය සහ අධ්‍යාපනය",
      "Community Support": "සමාජ සහාය",
      "Technical Support": "තාක්‍ෂණික සහාය",
      "Communication & IT Support": "සන්නිවේදන සහ IT සහාය",
      "Transportation & Logistics": "ප්‍රවාහන සහ භාණ්ඩාගම් සහාය",
      "GIS & Mapping": "GIS සහ සිතියම්කරණය",
      "Recovery & Reconstruction": "ප්‍රතිසංස්කරණය සහ ප්‍රතිනිර්මාණය",
      "Debris Removal & Cleanup": "අපද්‍රව්‍ය ඉවත් කිරීම සහ පිරිසිදු කිරීම",
      "Rebuilding Infrastructure": "ජන්මන සංවර්ධනය",
      "Livelihood Restoration": "ජීවනෝපාය ප්‍රතිස්ථාපනය",
      "Disaster Preparedness": "ආපදා සූදානම්වීම",
      "Community Training & Drills": "සමාජ පුහුණුව සහ අභ්‍යාස",
      "Animal Rescue": "සත්ව ගලවා ගැනීම",
      "Animal Evacuation & Shelter": "සත්ව ඉවත්වීම සහ ආරක්‍ෂිත ස්ථාන",
      "Wildlife Conservation": "වනජීවි සංරක්‍ෂණය"
    },
  },
  ta: {
    translation: {
      "InfoUnity Response": "தகவல் ஒற்றுமை பதில்",
      "logo.alt": "தகவல் ஒற்றுமை லோகோ",
      "nav.realtime": "நேரலை",
      "nav.learn": "கற்றல்",
      "nav.tools": "கருவிகள்",
      "nav.volunteer": "தன்னார்வலர்",
      "nav.disasterCatalogue": "பேரிடர் பட்டியல்",
      "nav.aiChatbot": "AI அரட்டை பாட்",
      "nav.responseManagement": "பதில் மேலாண்மை",
      "nav.missingPersonRegistry": "காணாமல் போனவர் பதிவேடு",
      "nav.sos": "அவசர அழைப்பு",
      "nav.login": "உள்நுழைய",
      "nav.profile": "சுயவிவரம்",
      "Comprehensive Disaster Response Platform": "விரிவான பேரிடர் பதில் தளம்",
      "A multi-featured web application designed to enhance disaster preparedness, response, and recovery efforts.":
        "பேரிடர் தயார்நிலை, பதில் மற்றும் மீட்பு முயற்சிகளை மேம்படுத்த வடிவமைக்கப்பட்ட பல அம்சங்கள் கொண்ட வலை பயன்பாடு.",
      "Development in progress": "மேம்பாடு நடந்துகொண்டிருக்கிறது",
      "Uniting Information, Empowering Response":
        "தகவல்களை இணைத்து, பதிலை மேம்படுத்துதல்",
      "Search divisional secretariats...":
        "வட்டார செயலாளர் அலுவலகத்தை தேடுங்கள்...",
      "Weather and Response Status in": "இல் வானிலை மற்றும் பதில் நிலை",
      "Warning Level": "எச்சரிக்கை நிலை",
      "Safety Status": "பாதுகாப்பு நிலை",
      "Volunteer Need": "தன்னார்வத் தேவைகள்",
      Safe: "பாதுகாப்பானது",
      "Not Safe": "பாதுகாப்பற்றது",
      Required: "தேவை",
      "Not Required": "தேவையில்லை",
      "High Risk": "உயர் அபாயம்",
      "Medium Risk": "மிதமான அபாயம்",
      "Low Risk": "குறைந்த அபாயம்",
      "Loading...": "நகர்த்துகிறது...",

      // Info Unity Section
      "section.information.title": "தகவல்",
      "section.information.description":
        "பேரிடர்களின் போது துல்லியமான, நிகழ்நேர தகவல்களை வழங்குங்கள். நிகழ்நேர வரைபடம், AI சாட்போட் மற்றும் பேரிடர் பட்டியல் மூலம் அடையப்படுகிறது.",
      "section.unity.title": "ஒற்றுமை",
      "section.unity.description":
        "பேரிடர் பதில் முயற்சிகளில் சமூகங்கள், தன்னார்வலர்கள் மற்றும் அதிகாரிகளை ஒன்றிணைக்கவும். தன்னார்வலர் மேலாண்மை, காணாமல் போனவர் பதிவேடு மற்றும் வள ஒதுக்கீடு அம்சங்களால் வசதி செய்யப்படுகிறது.",
      "section.response.title": "பதில்",
      "section.response.description":
        "பேரிடர் தாக்கத்தை குறைக்க விரைவான, ஒருங்கிணைந்த பதிலை செயல்படுத்துங்கள். தன்னார்வலர் மேலாண்மை, காணாமல் போனவர் பதிவேடு மற்றும் வள ஒதுக்கீடு அம்சங்களால் வசதி செய்யப்படுகிறது.",
      "section.whatFor": "நீங்கள் இங்கே எதற்காக இருக்கிறீர்கள்?",
      "button.reportDisaster": "பேரிடரை புகாரளிக்கவும்",

      // Action Buttons
      "action.realtimeMaps": "நிகழ்நேர வரைபடங்கள்",
      "action.supportChatbot": "ஆதரவு சாட்போட்",
      "action.volunteer": "தன்னார்வலர்",
      "action.missingRegistry": "காணாமல் போனவர் பதிவேடு",
      "action.resources": "வள ஒதுக்கீடு",
      "action.donate": "நன்கொடை",

      // Who Are We Section
      "whoWeAre.title": "தகவல் ஒற்றுமை பதிலில் நாங்கள் யார்?",
      "whoWeAre.partnership": "கூட்டாண்மையுடன்",

      // Emergency Response Grid
      "emergency.stayInformed": "தெரிந்து கொள்ளுங்கள்",
      "emergency.drought": "வறட்சிக்கு பதில்",
      "emergency.tsunami": "சுனாமிக்கு பதில்",
      "emergency.flood": "மழை / வெள்ளத்திற்கு பதில்",
      "emergency.landslide": "மண்சரிவுக்கு பதில்",
      // Latest Updates Section
      "updates.latestUpdates": "சமீபத்திய புதுப்பிப்புகள்",
      "updates.scrollLeft": "இடது பக்கம் உருட்டவும்",
      "updates.scrollRight": "வலது பக்கம் உருட்டவும்",
      "updates.untitledUpdate": "தலைப்பில்லாத புதுப்பிப்பு",
      "updates.noDescription": "விளக்கம் எதுவும் இல்லை",
      "updates.unknownLocation": "இடம் தெரியவில்லை",
      "updates.statusPending": "நிலுவையில் உள்ளது",
      "updates.anonymous": "அநாமதேய",
      "updates.magnitude": "அளவு",
      "updates.casualties": "உயிரிழப்புகள்",
      "updates.damageLevel": "சேத அளவு",
      "updates.evacuationStatus": "வெளியேற்ற நிலை",
      "updates.createdBy": "உருவாக்கியவர்",

      // Status translations
      "updates.status.approved": "அங்கீகரிக்கப்பட்டது",
      "updates.status.pending": "நிலுவையில் உள்ளது",
      "updates.status.rejected": "நிராகரிக்கப்பட்டது",

      // Damage level translations
      "updates.damageLevels.severe": "கடுமையான",
      "updates.damageLevels.moderate": "மிதமான",
      "updates.damageLevels.minor": "சிறிய",

      // Evacuation status translations
      "updates.evacuationStatuses.required": "தேவை",
      "updates.evacuationStatuses.recommended": "பரிந்துரைக்கப்படுகிறது",
      "updates.evacuationStatuses.notRequired": "தேவையில்லை",
      "logo.alt": "தகவல் ஒற்றுமை லோகோ",
      "logo.partner1": "செஞ்சிலுவை லோகோ",
      "logo.partner2": "பேரிடர் முகாமைத்துவ மையம் லோகோ",
      "whoWeAre.vision.title": "தகவல் ஒற்றுமை பதிலின் ஒட்டுமொத்த பார்வை என்ன?",
      "whoWeAre.vision.content":
        "தகவல் ஒற்றுமை பதில் பேரழிவுகளின் போது சமூகங்கள் தாங்கிக்கொள்ளக்கூடிய, முக்கியமான தகவல்கள் மற்றும் வளங்களுக்கான தடையற்ற அணுகல் மூலம் அதிகாரம் பெற்ற எதிர்காலத்தை கண்டுகிறது. பேரழிவுகளால் பாதிக்கப்பட்டவர்களுக்கும் அவற்றுக்கு பதிலளிப்பவர்களுக்கும் இடையிலான இடைவெளியை நிரப்பும் ஒருங்கிணைந்த தளத்தை உருவாக்குவதன் மூலம் பேரிடர் மேலாண்மையை புரட்சிகரமாக்க நாங்கள் நோக்கமாக கொண்டுள்ளோம்.",

      "whoWeAre.mission.title":
        "தகவல் ஒற்றுமை பதிலின் பணி அதன் தொழில்நுட்ப செயல்பாட்டுடன் எவ்வாறு இணைகிறது?",
      "whoWeAre.mission.content":
        "தகவல் ஒற்றுமை பதிலின் பணி என்பது பேரிடர் தொடர்பான தகவல்களை ஒருங்கிணைக்கும், பதில் முயற்சிகளை ஒருங்கிணைக்கும், மற்றும் நெருக்கடியின் போது விரைவாகவும் திறம்படவும் செயல்பட சமூகங்களுக்கு அதிகாரமளிக்கும் விரிவான, பயனர் நட்பு தளத்தை வழங்குவதாகும். சாதனங்கள் மற்றும் நெட்வொர்க் நிலைமைகள் முழுவதும் அணுகக்கூடிய முற்போக்கு வலை பயன்பாட்டை (PWA) உருவாக்குவதற்கான எங்கள் தொழில்நுட்ப அணுகுமுறையுடன் இந்த பணி சரியாக பொருந்துகிறது.",

      "whoWeAre.brand.title": "தகவல் ஒற்றுமை பதில் பிராண்ட் எதை குறிக்கிறது?",
      "whoWeAre.brand.content":
        "தகவல் ஒற்றுமை பதில் பிராண்ட் எதிர்மறையான சூழ்நிலையில் நம்பிக்கை, புதுமை மற்றும் சமூக அதிகாரமளித்தலை குறிக்கிறது. தகவல்களும் மக்களும் ஒன்றிணையும்போது, எந்த சவாலுக்கும் திறம்பட பதிலளிக்க முடியும் என்ற கருத்தை எங்கள் பிராண்ட் உள்ளடக்குகிறது.",

      "whoWeAre.responsibilities.title":
        "முக்கிய பொறுப்புகள் மற்றும் கடமைகள் என்ன?",
      "whoWeAre.responsibilities.content":
        "தகவல் ஒற்றுமை பதில் அதன் பயனர்கள் மற்றும் அது சேவை செய்யும் சமூகங்களுக்கு குறிப்பிடத்தக்க பொறுப்பைக் கொண்டுள்ளது. பேரிடர்களின் போது உயிர்கள் அதை நம்பியிருக்கலாம் என்பதால், நாங்கள் வழங்கும் தகவல்களின் துல்லியம் மற்றும் நேரத்தை உறுதிப்படுத்துவது எங்கள் முதன்மை கடமையாகும்.",

      "whoWeAre.technology.title":
        "தகவல் ஒற்றுமை பதில் தொழில்நுட்பத்தை எவ்வாறு பயன்படுத்துகிறது?",
      "whoWeAre.technology.content":
        "தகவல் ஒற்றுமை பதில் நவீன தொழில்நுட்பங்களை உத்திபூர்வமாக பயன்படுத்துவதன் மூலம் பேரிடர் மேலாண்மையின் முன்னணியில் இருக்கிறது. எதிர்வினை பதிலுக்கு பதிலாக முன்னெச்சரிக்கை பதில்களை அனுமதிக்க, பேரிடர் தாக்க முன்கணிப்பு மற்றும் வள ஒதுக்கீட்டிற்கு இயந்திர கற்றல் வழிமுறைகளை நாங்கள் பயன்படுத்துகிறோம்.",

      "logo.alt": "தகவல் ஒற்றுமை லோகோ",
      email: "மின்னஞ்சல்",
      password: "கடவுச்சொல்",
      as: "படி",
      dontHaveAccount: "கணக்கு இல்லையா?",
      register: "பதிவு செய்யவும்",

      registerAsRespondent: "ஒரு பதிலளிப்பாளராக பதிவு செய்யவும்",
      nicNumber: "என்ஐசி எண்",
      fullName: "முழு பெயர்",
      mobileNumber: "மொபைல் எண்",
      registrationFailed: "பதிவு தோல்வி. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
      nicValidationError:
        "என்ஐசி எண் 12 அல்லது 13 எழுத்துகளையும் எண்களையும் கொண்டிருக்க வேண்டும்.",
      mobileValidationError: "மொபைல் எண் 9 எண்களாக இருக்க வேண்டும்.",
      alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
      login: "உள்நுழைவு",
      register: "பதிவு",
      registerAsVolunteer: "வாலன்டியராக பதிவு செய்யவும்",
      nicNumber: "என்ஐசி எண்",
      fullName: "முழு பெயர்",
      mobileNumber: "மொபைல் எண்",
      alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
      locationValidationError: " மாவட்டம் மற்றும் பிரிவு தேவை.",
      nicValidationError:
        "என்ஐசி எண் 12 அல்லது 13 எழுத்துகளையும் எண்களையும் கொண்டிருக்க வேண்டும்.",
      mobileValidationError: "மொபைல் எண் 9 எண்களாக இருக்க வேண்டும்.",
      emailValidationError: "மின்னஞ்சல் வடிவம் தவறானது.",
      passwordValidationError:
        "கடவுச்சொல் குறைந்தது 6 எழுத்துகளாக இருக்க வேண்டும்.",
      redCrossVolunteer: "நீங்கள் ரெட் கிராஸ் வாலன்டியராக இருக்கிறீர்களா?",
      "disasterCategories": "பேரிடர் வகைகள்",
      "searchDisasterCategories": "பேரிடர் வகைகளை தேடு...",
      "Emergency Response": "அவசர பதில்",
      "Search and Rescue (SAR)": "தேடல் மற்றும் மீட்பு (SAR)",
      "Medical Assistance": "மருத்துவ உதவி",
      "Firefighting Support": "தீயணைப்பு ஆதரவு",
      "Evacuation Assistance": "காலி செய்தல் உதவி",
      "Damage Assessment": "சேதம் மதிப்பீடு",
      "Relief and Humanitarian Aid": "நிவாரண மற்றும் மனிதாபிமான உதவி",
      "Food Distribution": "உணவு விநியோகம்",
      "Shelter Assistance": "தங்குமிட உதவி",
      "Clothing & Supplies Distribution": "ஆடை மற்றும் பொருட்கள் விநியோகம்",
      "Water, Sanitation, and Hygiene (WASH) Support": "நீர், சுகாதாரம் மற்றும் தூய்மை (WASH) ஆதரவு",
      "Psychosocial Support": "மனோசமூக ஆதரவு",
      "Counseling and Psychological First Aid": "ஆலோசனை மற்றும் மனோவேதியல் முதல் உதவி",
      "Childcare & Education": "குழந்தை பராமரிப்பு மற்றும் கல்வி",
      "Community Support": "சமூக ஆதரவு",
      "Technical Support": "தொழில்நுட்ப ஆதரவு",
      "Communication & IT Support": "தொடர்பு மற்றும் IT ஆதரவு",
      "Transportation & Logistics": "போக்குவரத்து மற்றும் லாஜிஸ்டிக்ஸ் ஆதரவு",
      "GIS & Mapping": "GIS மற்றும் மேப்பிங்",
      "Recovery & Reconstruction": "மீட்பு மற்றும் மறுகட்டுமானம்",
      "Debris Removal & Cleanup": "குப்பை அகற்றுதல் மற்றும் சுத்தம் செய்தல்",
      "Rebuilding Infrastructure": "உள்கட்டமைப்பு மறுகட்டுமானம்",
      "Livelihood Restoration": "வாழ்வாதார மீட்பு",
      "Disaster Preparedness": "பேரிடர் தயார்நிலை",
      "Community Training & Drills": "சமூக பயிற்சி மற்றும் பயிற்சிகள்",
      "Animal Rescue": "விலங்கு மீட்பு",
      "Animal Evacuation & Shelter": "விலங்கு காலி செய்தல் மற்றும் தங்குமிடம்",
      "Wildlife Conservation": "வனவிலங்கு பாதுகாப்பு"
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: "en",
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
