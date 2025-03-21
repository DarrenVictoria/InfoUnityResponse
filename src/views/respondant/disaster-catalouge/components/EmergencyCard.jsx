import { Link } from "react-router-dom";


const EmergencyCard = ({ title, image, path }) => {
    return (
        <Link 
            to={path}
            className="block w-64 h-72 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer"
            role="button"
            tabIndex={0}
        >
            {/* Image container with transparent background */}
            <div className="h-48 bg-transparent p-4">
                <img 
                    src={image} 
                    alt={title}
                    className="w-full h-full object-contain"
                />
            </div>
            
            {/* Text container with solid background */}
            <div className="h-24 bg-gray-800 p-4">
                <h3 className="text-white text-center font-bold text-lg">{title}</h3>
            </div>
        </Link>
    );
};

export default EmergencyCard;