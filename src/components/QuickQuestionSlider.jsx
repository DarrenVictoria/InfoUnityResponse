import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const QuickQuestionsSlider = ({ language, onQuestionSelect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const questions = {
        english: [
            {
                category: "Flood",
                questions: [
                    "What should I do when flood warning is issued?",
                    "How to protect my house from floods?",
                    "What items should I keep in emergency flood kit?"
                ],
                color: "bg-blue-100"
            },
            {
                category: "Landslide",
                questions: [
                    "What are early warning signs of landslides?",
                    "Which areas are prone to landslides?",
                    "How to secure my home against landslides?"
                ],
                color: "bg-yellow-100"
            },
            {
                category: "Drought",
                questions: [
                    "How to conserve water during drought?",
                    "What crops are suitable during drought?",
                    "How to prepare for long-term drought?"
                ],
                color: "bg-red-100"
            }
        ],
        සිංහල: [
            {
                category: "ගංවතුර",
                questions: [
                    "ගංවතුර අනතුරු ඇඟවීමක් නිකුත් කළ විට මම කුමක් කළ යුතුද?",
                    "ගංවතුරෙන් මගේ නිවස ආරක්ෂා කරගන්නේ කෙසේද?",
                    "හදිසි ගංවතුර කට්ටලයක තිබිය යුතු දේ මොනවාද?"
                ],
                color: "bg-blue-100"
            },
            {
                category: "නායයෑම්",
                questions: [
                    "නායයෑම්වල පූර්ව අනතුරු ඇඟවීම් මොනවාද?",
                    "නායයෑම් වලට ලක්විය හැකි ප්‍රදේශ මොනවාද?",
                    "නායයෑම් වලින් මගේ නිවස ආරක්ෂා කරගන්නේ කෙසේද?"
                ],
                color: "bg-yellow-100"
            },
            {
                category: "නියඟය",
                questions: [
                    "නියඟ සමයේදී ජලය සංරක්ෂණය කරන්නේ කෙසේද?",
                    "නියඟයට සුදුසු බෝග මොනවාද?",
                    "දිගුකාලීන නියඟයකට සූදානම් වන්නේ කෙසේද?"
                ],
                color: "bg-red-100"
            }
        ],
        தமிழ்: [
            {
                category: "வெள்ளம்",
                questions: [
                    "வெள்ள எச்சரிக்கை விடுக்கப்பட்டால் என்ன செய்ய வேண்டும்?",
                    "வெள்ளத்திலிருந்து எனது வீட்டை எவ்வாறு பாதுகாப்பது?",
                    "அவசர வெள்ள கிட்டில் என்ன பொருட்களை வைத்திருக்க வேண்டும்?"
                ],
                color: "bg-blue-100"
            },
            {
                category: "மண்சரிவு",
                questions: [
                    "மண்சரிவுகளின் முன்னறிவிப்பு அறிகுறிகள் என்ன?",
                    "மண்சரிவுகளுக்கு ஆளாகக்கூடிய பகுதிகள் எவை?",
                    "மண்சரிவுகளிலிருந்து எனது வீட்டை எவ்வாறு பாதுகாப்பது?"
                ],
                color: "bg-yellow-100"
            },
            {
                category: "வறட்சி",
                questions: [
                    "வறட்சியின் போது நீரை எவ்வாறு சேமிப்பது?",
                    "வறட்சிக்கு ஏற்ற பயிர்கள் எவை?",
                    "நீண்டகால வறட்சிக்கு எவ்வாறு தயாராவது?"
                ],
                color: "bg-red-100"
            }
        ]
    };

    const currentQuestions = questions[language] || questions.english;
    const totalSets = currentQuestions.length;

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === totalSets - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? totalSets - 1 : prevIndex - 1
        );
    };

    return (
        <div className="w-full overflow-hidden relative rounded-lg"  >
            <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` ,margin:'30px',padding:'10px'}}>
                {currentQuestions.map((set, index) => (
                    <div key={index} className={`min-w-full flex space-x-4 p-4 ${set.color} rounded-lg`}>
                        {set.questions.map((question, idx) => (
                            <button
                                key={idx}
                                onClick={() => onQuestionSelect(question)}
                                className="flex-1 p-3 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            
            <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default QuickQuestionsSlider;