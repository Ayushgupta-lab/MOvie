import React, { createContext, useContext, useState, useEffect } from 'react';
import { City } from '../types/index.js';
import { api } from '../services/api.js';

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  cities: City[];
  isCityModalOpen: boolean;
  setIsCityModalOpen: (open: boolean) => void;
  detectLocation: () => void;
  isDetectingLocation: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('cinenova_city') || 'Mumbai';
  });
  const [cities, setCities] = useState<City[]>([]);
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.cities.getAll();
        if (res.success && res.cities) {
          setCities(res.cities);
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    };
    fetchCities();
  }, []);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem('cinenova_city', city);
    setIsCityModalOpen(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Find closest city using distance calculation
        if (cities.length > 0) {
          let closestCity = cities[0];
          let minDistance = Infinity;

          for (const city of cities) {
            const d = Math.hypot(city.lat - latitude, city.lng - longitude);
            if (d < minDistance) {
              minDistance = d;
              closestCity = city;
            }
          }

          setSelectedCity(closestCity.name);
        }
        setIsDetectingLocation(false);
      },
      (error) => {
        console.warn('Geolocation permission denied or error:', error.message);
        setIsDetectingLocation(false);
      }
    );
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        cities,
        isCityModalOpen,
        setIsCityModalOpen,
        detectLocation,
        isDetectingLocation,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
