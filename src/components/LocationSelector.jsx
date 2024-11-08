import React, { useState } from 'react';

const districtData = {
    Ampara: [
      "Addalaichenai", "Akkaraipattu", "Alaiyadivembu", "Damana", "Dehiaththakandiya", "Irakkamam", 
      "Kalmunai Tamil", "Kalmunai", "Karathivu", "Lahugala", "Mahaoya", "Namaloya", "Nawithanweli",
      "Ninthaur", "Padiyathalawa", "Pothuwil", "Sammanthurai", "Sainthamaruthu", "Thirukkovil", "Uhana"
    ],
    Anuradhapura: [
      "Galenbidunuwewa", "Horowpothana", "Ipalogama", "Kahatagasdigiliya", "Kebithigollewa", "Kekirawa",
      "Mahawilachchiya", "Medawachchiya", "Mihinthale", "Nachchaduwa", "Nochchiyagama", 
      "Nuwaragampalatha Central", "Nuwaragampalatha East", "Padaviya", "Palagala", "Palugaswewa",
      "Rajanganaya", "Rambewa", "Thalawa", "Thambuttegama", "Thirappane"
    ],
    Badulla: [
      "Badulla", "Bandarawela", "Ella", "Haldummulla", "Haliela", "Haputale", "Kandeketiya", 
      "Lunugala", "Mahiyanganaya", "Meegahakiwula", "Passara", "Ridimaliyadda", "Soranathota",
      "Uva-Paranagama", "Welimada"
    ],
    Batticaloa: [
      "Eravur Pattu", "Eravur Town", "Kattankudy", "Koralai Pattu", "Koralai Pattu Central", 
      "Koralai Pattu North", "Koralai Pattu South", "Koralai Pattu West", "Manmunai North", 
      "Manmunai South & Eruvil Pattu", "Manmunai South West", "Manmunai West", "Porativu Pattu"
    ],
    Colombo: [
      "Colombo", "Dehiwala-Mount Lavinia", "Homagama", "Kaduwela", "Kesbewa", "Kolonnawa",
      "Maharagama", "Moratuwa", "Padukka", "Ratmalana", "Seethawaka", "Sri Jayawardenepura Kotte",
      "Thimbirigasyaya"
    ],
    Galle: [
      "Akmeemana", "Ambalangoda", "Baddegama", "Balapitiya", "Benthota", "Bope-Poddala", "Elpitiya",
      "Galle Four Gravets", "Gonapinuwala", "Habaraduwa", "Hikkaduwa", "Imaduwa", "Karandeniya",
      "Nagoda", "Neluwa", "Niyagama", "Thawalama", "Weligama", "Yakkalamulla"
    ],
    Gampaha: [
      "Attanagalla", "Biyagama", "Divulapitiya", "Dompe", "Gampaha", "Ja-Ela", "Katana", "Kelaniya",
      "Mahara", "Minuwangoda", "Mirigama", "Negombo", "Wattala"
    ],
    Hambantota: [
      "Ambalantota", "Angunakolapelessa", "Beliatta", "Hambantota", "Katuwana", "Lunugamwehera", 
      "Okewela", "Sooriyawewa", "Tangalle", "Tissamaharama", "Walasmulla", "Weeraketiya"
    ],
    Jaffna: [
      "Delft", "Island North", "Island South", "Jaffna", "Karainagar", "Nallur", "Thenmarachchi",
      "Vadamarachchi East", "Vadamarachchi North", "Vadamarachchi South West", "Valikamam East",
      "Valikamam North", "Valikamam South", "Valikamam South West", "Valikamam West"
    ],
    Kalutara: [
      "Agalawatta", "Beruwala", "Bulathsinhala", "Dodangoda", "Horana", "Ingiriya", "Kalutara",
      "Madurawala", "Mathugama", "Millaniya", "Palindanuwara", "Panadura", "Walallawita"
    ],
    Kandy: [
      "Akurana", "Doluwa", "Ganga Ihala Korale", "Harispattuwa", "Hatharaliyadda", "Kandy Four Gravets",
      "Kundasale", "Medadumbara", "Minipe", "Panwila", "Pasbage Korale", "Pathahewaheta", "Poojapitiya",
      "Thumpane", "Udadumbara", "Udapalatha", "Udunuwara", "Yatinuwara"
    ],
    Kegalle: [
      "Aranayake", "Bulathkohupitiya", "Dehiowita", "Deraniyagala", "Galigamuwa", "Kegalle", 
      "Mawanella", "Rambukkana", "Warakapola", "Yatiyanthota"
    ],
    Kilinochchi: [
      "Karachchi", "Pachchilaipalli", "Poonakary", "Velanai"
    ],
    Kurunegala: [
      "Alawwa", "Ambanpola", "Bamunakotuwa", "Bingiriya", "Ehetuwewa", "Galgamuwa", "Ganewatta", 
      "Girathalana", "Ibbagamuwa", "Kuliyapitiya East", "Kuliyapitiya West", "Maho", "Mallawapitiya", 
      "Maspotha", "Mawathagama", "Narammala", "Nikaweratiya", "Panduwasnuwara", "Pannala", 
      "Polgahawela", "Polpithigama", "Rasnayakapura", "Rideegama", "Udubaddawa", "Wariyapola", 
      "Weerambugedara"
    ],
    Mannar: ["Madhu", "Mannar", "Manthai West", "Musalai", "Nanattan"],
    Matara: [
      "Athuraliya", "Devinuwara", "Dickwella", "Hakmana", "Kamburupitiya", "Kirinda Puhulwella", 
      "Kotapola", "Malimbada", "Matara", "Mulatiyana", "Pasgoda", "Pitabeddara", "Thihagoda", 
      "Weligama", "Welipitiya"
    ],
    Matale: [
        "Ambanganga Korale", "Dambulla", "Galewela", "Laggala-Pallegama", "Matale", "Naula", 
        "Pallepola", "Raththota", "Ukuwela", "Wilgamuwa"
      ],
      Monaragala: [
        "Badalkumbura", "Bibile", "Buttala", "Katharagama", "Madulla", "Medagama", "Monaragala", 
        "Sewanagala", "Siyabalanduwa", "Thanamalwila", "Wellawaya"
      ],
      Mullaitivu: [
        "Maritimepattu", "Oddusuddan", "Puthukudiyiruppu", "Thunukkai", "Welioya"
      ],
      NuwaraEliya: [
        "Ambagamuwa", "Hanguranketha", "Kothmale", "Nuwara Eliya", "Walapane"
      ],
      Polonnaruwa: [
        "Dimbulagala", "Elahera", "Hingurakgoda", "Lankapura", "Medirigiriya", "Thamankaduwa", 
        "Welikanda"
      ],
      Puttalam: [
        "Anamaduwa", "Arachchikattuwa", "Chilaw", "Dankotuwa", "Kalpitiya", "Karuwalagaswewa", 
        "Madampe", "Mahakumbukkadawala", "Mahawewa", "Mundel", "Nattandiya", "Nawagaththegama",
        "Pallama", "Puttalam", "Vanathavilluwa", "Wennappuwa"
      ],
      Ratnapura: [
        "Ayagama", "Balangoda", "Eheliyagoda", "Elapatha", "Embilipitiya", "Godakawela", "Imbulpe", 
        "Kahawatta", "Kalawana", "Kiriella", "Kolonna", "Kuruwita", "Nivithigala", "Opanayaka", 
        "Pelmadulla", "Ratnapura", "Weligepola"
      ],
      Trincomalee: [
        "Gomarankadawala", "Kantalai", "Kinniya", "Kuchchaveli", "Morawewa", "Muttur", 
        "Padavisripura", "Seruwila", "Thambalagamuwa", "Town & Gravets", "Verugal"
      ],
      Vavuniya: [
        "Vavuniya", "Vavuniya North", "Vavuniya South", "Vengalacheddikulam"
      ]
    
  };
  

  const LocationSelector = ({ onLocationChange }) => {
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
  
    const handleDistrictChange = (e) => {
      const district = e.target.value;
      setSelectedDistrict(district);
      setSelectedDivision('');
      onLocationChange(district, ''); // Reset DS Division when district changes
    };
  
    const handleDivisionChange = (e) => {
      const division = e.target.value;
      setSelectedDivision(division);
      onLocationChange(selectedDistrict, division);
    };
  
    return (
      <>
        {/* District Dropdown */}
        <select
          value={selectedDistrict}
          onChange={handleDistrictChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select District --</option>
          {Object.keys(districtData).map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
  
        {/* DS Division Dropdown */}
        {selectedDistrict && (
          <select
            value={selectedDivision}
            onChange={handleDivisionChange}
            className="w-full px-4 py-2 mt-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select DS Division --</option>
            {districtData[selectedDistrict].map((division) => (
              <option key={division} value={division}>{division}</option>
            ))}
          </select>
        )}
      </>
    );
  };
  
  export default LocationSelector;