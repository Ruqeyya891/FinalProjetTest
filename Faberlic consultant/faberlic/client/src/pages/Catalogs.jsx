import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Catalogs = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/catalogs');
        setCatalogs(res.data);
      } catch (error) {
        toast.error('Kataloqları yükləyərkən xəta baş verdi.');
        console.error('Catalog fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogs();
  }, []);

  if (loading) {
    return (
      <div className="bg-pink-50/30 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-pink-50/30 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Reqemsal Kataloqlar
          </h1>
          <p className="text-lg text-gray-600">
            Faberlic məhsullarını kataloqlarda araşdırın
          </p>
        </div>

        {catalogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-pink-200">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Hələ kataloq yoxdur
            </h3>
            <p className="text-gray-500">
              Tezliklə yeni kataloqlar əlavə olunacaq!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalogs.map((catalog) => (
              <div
                key={catalog._id}
                className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={catalog.image}
                    alt={catalog.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {catalog.name}
                  </h3>
                  <a
                    href={catalog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all shadow-md"
                  >
                    Kataloqu Aç
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogs;
