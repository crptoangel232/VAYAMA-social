import React, { useState, useRef } from 'react';

const initialPhotos = {
  Trips: [
    { id: 1, url: 'https://picsum.photos/seed/trip1/400/300', caption: 'Beach Sunset' },
    { id: 2, url: 'https://picsum.photos/seed/trip2/400/300', caption: 'Mountain View' },
    { id: 3, url: 'https://picsum.photos/seed/trip3/400/300', caption: 'City Market' },
    { id: 4, url: 'https://picsum.photos/seed/trip4/400/300', caption: 'Historical Landmark' },
  ],
  Events: [
    { id: 5, url: 'https://picsum.photos/seed/event1/400/300', caption: 'Music Festival' },
    { id: 6, url: 'https://picsum.photos/seed/event2/400/300', caption: 'Family Gathering' },
  ],
  Food: [
    { id: 7, url: 'https://picsum.photos/seed/food1/400/300', caption: 'Local Dish' },
    { id: 8, url: 'https://picsum.photos/seed/food2/400/300', caption: 'Street Food' },
    { id: 9, url: 'https://picsum.photos/seed/food3/400/300', caption: 'Fine Dining' },
  ],
};

type Category = 'Trips' | 'Events' | 'Food';

const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('Trips');
  const [galleryPhotos, setGalleryPhotos] = useState(initialPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const newPhoto = {
              id: Date.now(),
              url: URL.createObjectURL(file),
              caption: 'Newly Uploaded'
          };
          setGalleryPhotos(prev => ({
              ...prev,
              [activeCategory]: [newPhoto, ...prev[activeCategory]]
          }));
          event.target.value = '';
      }
  };

  return (
    <div className="p-4">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Gallery</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your saved memories, all in one place.</p>
      </header>

      <div className="mb-6">
        <div className="flex justify-around bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
          {(Object.keys(galleryPhotos) as Category[]).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`w-full p-2 rounded-md text-xs font-medium transition-colors ${
                activeCategory === category ? 'bg-white dark:bg-slate-700 text-blue-500 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {galleryPhotos[activeCategory].map(photo => (
          <div key={photo.id} className="relative group overflow-hidden rounded-lg shadow-sm">
            <img src={photo.url} alt={photo.caption} className="w-full h-32 md:h-40 object-cover group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                <p className="text-white text-xs font-semibold">{photo.caption}</p>
            </div>
          </div>
        ))}
      </div>
       <div className="text-center mt-8">
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <button 
                onClick={handleUploadClick}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition-colors text-sm"
            >
                Upload New Photo
            </button>
        </div>
    </div>
  );
};

export default Gallery;