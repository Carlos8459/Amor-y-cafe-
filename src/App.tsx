/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Coffee, 
  Heart, 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  ChevronLeft,
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Clock, 
  Phone, 
  Info,
  Check,
  Wifi,
  Map,
  Share2,
  ThumbsUp,
  MessageSquare,
  Gift,
  Menu,
  Instagram,
  Facebook,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MENU_ITEMS, MenuItem, CATEGORIES_LABELS, SUBCATEGORIES_LABELS } from './data';
import logoAmorYCafe from './assets/images/logo_amor_y_cafe_1780705355382.png';

// Framer Motion staggered grid entrance animations
const entranceContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    }
  }
};

const entranceItemVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 17,
    }
  }
};

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

// Helper functions for Accent-insensitive, smart Spanish search matching with Synonym support
const smartNormalize = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
    .trim();
};

const getExtendedSearchTerms = (query: string): string[] => {
  const normalized = smartNormalize(query);
  const terms = [normalized];
  
  if (normalized.includes('ques')) {
    terms.push('queso', 'quesadilla', 'cheddar');
  }
  if (normalized.includes('papa') || normalized.includes('patata')) {
    terms.push('papas', 'salchipapas', 'fritas');
  }
  if (normalized.includes('cafe') || normalized.includes('capu')) {
    terms.push('capuccino', 'mocaccino', 'latte', 'chai', 'espresso');
  }
  if (normalized.includes('res') || normalized.includes('carne') || normalized.includes('filete')) {
    terms.push('beef', 'rib eye', 'new york', 'hamburguesa', 'fajitas');
  }
  if (normalized.includes('pollo') || normalized.includes('pechuga')) {
    terms.push('deditos', 'alitas', 'quesadillas');
  }
  if (normalized.includes('frio') || normalized.includes('helar') || normalized.includes('frap')) {
    terms.push('frappe', 'frias', 'iced', 'licuado', 'batido');
  }
  if (normalized.includes('limon')) {
    terms.push('limonada', 'hierbabuena');
  }
  return terms;
};

// Local heuristic for chef specials (Serverless Client-Only Heuristics)
const getLocalClientSpecials = (weather: string, timeOfDay: string) => {
  let specialIds: string[] = [];
  let theme = "";
  let explanation = "";

  if (weather === "lluvioso" || weather === "frio") {
    theme = "Abrazo Cálido Waslaleño 🌧️";
    if (timeOfDay === "manana") {
      theme = "Amargor Suave & Abrigo 🌅";
      explanation = "Con cielos grises en Waslala, nada como un Capuccino Sencillo caliente y Tostones con Queso recién sacados de la paila.";
      specialIds = ["capuccino-sencillo", "tostones-queso", "capuccino-doble", "dirty-chai-tea", "quesadillas-pollo"];
    } else if (timeOfDay === "tarde") {
      theme = "Cafetería y Tarde Lluviosa ☕";
      explanation = "Tarde nublada y lluviosa. Refúgiate con un reconfortante Café Mocaccino caliente y unas deliciosas Quesadillas de Pollo doradas.";
      specialIds = ["mocaccino", "quesadillas-pollo", "dirty-chai-tea", "capuccino-sencillo", "tostones-queso", "frappe-oreo"];
    } else {
      theme = "Noche de Lluvia y Sabor 🔥";
      explanation = "Para abrigar la noche fresca, te consentimos con el calor de un Rib Eye Premium y un cremoso Capuccino Doble.";
      specialIds = ["rib-eye", "capuccino-doble", "tostones-queso", "new-york", "dirty-chai-tea", "extra-papas"];
    }
  } else {
    // Soleado / Caluroso
    if (timeOfDay === "manana") {
      theme = "Mañana Radiante Waslala ☀️";
      explanation = "Para iniciar este día soleado con frescura y energía, degusta un refrescante Iced Latte Clásico y Hamburguesa de Res.";
      specialIds = ["iced-latte", "hamburguesa-res", "limonada-hierbabuena", "salchipapas", "tostones-queso"];
    } else if (timeOfDay === "tarde") {
      theme = "Delicias Frías para la Tarde 🍧";
      explanation = "¡El sol de Waslala está radiante! Date un gran gusto helado con el inigualable Frappuccino de Oreos de la Casa.";
      specialIds = ["frappe-oreo", "frappe-caramelo", "salchipapas", "limonada-frutos-rojos", "quesadillas-pollo"];
    } else {
      theme = "Sabor y Brisa Nocturna 🌙";
      explanation = "Disfruta de la noche con una refrescante Limonada de Frutos Rojos y nuestro exquisito New York Strip.";
      specialIds = ["limonada-frutos-rojos", "new-york", "extra-papas", "hamburguesa-res", "limonada-hierbabuena"];
    }
  }
  return { theme, explanation, specialIds };
};

// Local heuristic recommendations (Serverless Client-Only Heuristics)
const getLocalClientRecommendations = (cartItems: any[]) => {
  const currentIds = new Set(cartItems.map((it) => it.id));
  
  // Classify items in cart
  const hasFood = cartItems.some((it) => it.category === "comidas");
  const hasDrink = cartItems.some((it) => it.category === "bebidas");

  let recs: string[] = [];
  let reason = "";

  if (hasFood && !hasDrink) {
    // Recommend matching beverages
    recs = ["limonada-hierbabuena", "iced-latte", "capuccino-sencillo", "americano", "batido-fresa"];
    reason = "Para acompañar tus platillos, nada como un elíxir fresco o un café de altura.";
  } else if (hasDrink && !hasFood) {
    // Recommend matching foods
    recs = ["tostones-queso", "quesadillas-pollo", "salchipapas", "hamburguesa-res"];
    reason = "El maridaje ideal para consentir tu paladar con sabor waslaleño.";
  } else {
    // Has both, recommend sweet treat or extra
    recs = ["frappe-oreo", "extra-papas", "frappe-caramelo", "salchipapas"];
    reason = "El broche de oro dulce o extra crujiente para tu pedido perfecto.";
  }

  // Filter out items already in the cart and limit to 2 suggestions
  const filteredRecs = recs.filter(id => !currentIds.has(id)).slice(0, 2);

  if (filteredRecs.length === 0) {
    const backupList = ["tostones-queso", "limonada-hierbabuena", "capuccino-sencillo"];
    const backup = backupList.filter(id => !currentIds.has(id)).slice(0, 2);
    return {
      recommendations: backup,
      reason: "Las mejores recomendaciones de la casa elegidas para ti hoy."
    };
  }

  return {
    recommendations: filteredRecs,
    reason
  };
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  
  // States with direct localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('amor_y_cafe_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading cart from localStorage:", e);
      return [];
    }
  });

  // Keep localStorage up to date
  useEffect(() => {
    try {
      localStorage.setItem('amor_y_cafe_cart', JSON.stringify(cart));
    } catch (e) {
      console.error("Error saving cart to localStorage:", e);
    }
  }, [cart]);

  // Micro-animations states
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [cartAnimationTrigger, setCartAnimationTrigger] = useState<boolean>(false);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  
  // Persist name and address (or pickup time) based on defaults in localStorage
  const [customerName, setCustomerName] = useState<string>(() => {
    try {
      return localStorage.getItem('amor_y_cafe_customer_name') || '';
    } catch (e) {
      return '';
    }
  });

  const [orderNotes, setOrderNotes] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'llevar'>('delivery');

  const [addressOrTime, setAddressOrTime] = useState<string>(() => {
    try {
      return localStorage.getItem('amor_y_cafe_default_address') || '';
    } catch (e) {
      return '';
    }
  });

  // Guardar nombre predeterminado en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('amor_y_cafe_customer_name', customerName);
    } catch (e) {
      console.error("Error saving customerName to localStorage:", e);
    }
  }, [customerName]);

  // Guardar dirección predeterminada en localStorage (solo si es tipo 'delivery')
  useEffect(() => {
    if (deliveryType === 'delivery' && addressOrTime.trim()) {
      try {
        localStorage.setItem('amor_y_cafe_default_address', addressOrTime);
      } catch (e) {
        console.error("Error saving default address to localStorage:", e);
      }
    }
  }, [addressOrTime, deliveryType]);

  // AI-powered Recommendations states
  const cartSerializedIds = useMemo(() => {
    return cart.map(ci => `${ci.item.id}:${ci.quantity}`).join(",");
  }, [cart]);

  // AI Specials of Day Custom Configuration (Weather & Time) - Computed completely automatically on load
  const [selectedWeather, setSelectedWeather] = useState<'lluvioso' | 'frio' | 'soleado'>(() => {
    const day = new Date().getDate();
    const hour = new Date().getHours();
    // Immediate smart simulated guess for Waslala during loading state
    if (hour >= 18 || hour < 6) {
      return day % 2 === 0 ? 'frio' : 'lluvioso';
    }
    return day % 2 === 0 ? 'soleado' : 'lluvioso';
  });

  const [selectedTime, setSelectedTime] = useState<'manana' | 'tarde' | 'noche'>(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'manana';
    if (hour >= 12 && hour < 18) return 'tarde';
    return 'noche';
  });

  // Automatically load local device time & real-time live internet weather for Waslala, Nicaragua coordinates
  useEffect(() => {
    // 1. Sync exact local hour (device/telephone clock time)
    const syncDeviceTime = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        setSelectedTime('manana');
      } else if (hour >= 12 && hour < 18) {
        setSelectedTime('tarde');
      } else {
        setSelectedTime('noche');
      }
    };
    syncDeviceTime();

    // 2. Fetch live weather conditions from a free open meteorological API for Waslala
    const fetchRealTimeWeather = async (lat: number, lon: number) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,rain,weather_code&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather service unreachable");
        const json = await res.json();

        if (json && json.current) {
          const temp = json.current.temperature_2m ?? 23;
          const rain = json.current.rain ?? 0;
          const code = json.current.weather_code ?? 0;

          // Classify the local Nicaraguan weather based on standard meteorological categories
          // WMO codes 50-99 correspond to drizzle, rain, rain showers, and storms
          const isLluvioso = rain > 0 || (code >= 50 && code <= 99);
          const isFrio = temp < 19; // Comfortable cold limit for mountainous region of Waslala

          if (isLluvioso) {
            setSelectedWeather('lluvioso');
          } else if (isFrio) {
            setSelectedWeather('frio');
          } else {
            setSelectedWeather('soleado');
          }
          console.log(`[Internet Weather] Waslala Coords: ${lat}, ${lon}. Temp: ${temp}°C, Lluvia: ${rain}mm, Código: ${code}`);
        }
      } catch (err) {
        console.warn("[Internet Weather] Fallback used due to fetch error:", err);
      }
    };

    // Always fetch weather directly for Waslala to respect user's location preference without prompts.
    fetchRealTimeWeather(13.2333, -85.3833);
  }, []);

  const [aiSpecialsTheme, setAiSpecialsTheme] = useState<string>('Recomendación de la Casa');
  const [aiSpecialsExplanation, setAiSpecialsExplanation] = useState<string>('Platillos seleccionados con cariño para Waslala.');
  const [aiSpecialsItems, setAiSpecialsItems] = useState<MenuItem[]>([]);
  const [isAiSpecialsLoading, setIsAiSpecialsLoading] = useState<boolean>(false);

  // Specials Slide Control States
  const [activeSpecialsSlide, setActiveSpecialsSlide] = useState<number>(0);
  const [isSpecialsHovered, setIsSpecialsHovered] = useState<boolean>(false);
  const [showDeveloperModal, setShowDeveloperModal] = useState<boolean>(false);

  useEffect(() => {
    setIsAiSpecialsLoading(true);
    // Client-side execution without server dependency
    const data = getLocalClientSpecials(selectedWeather, selectedTime);
    setAiSpecialsTheme(data.theme || 'Recomendación de la Casa');
    setAiSpecialsExplanation(data.explanation || 'Platillos seleccionados con cariño para Waslala.');
    if (data.specialIds && Array.isArray(data.specialIds)) {
      const items = data.specialIds
        .map((id: string) => MENU_ITEMS.find(it => it.id === id))
        .filter((it): it is MenuItem => !!it);
      setAiSpecialsItems(items);
    }
    setActiveSpecialsSlide(0);
    setIsAiSpecialsLoading(false);
  }, [selectedWeather, selectedTime]);

  // Specials Auto-Rotation effect
  useEffect(() => {
    if (isSpecialsHovered || aiSpecialsItems.length === 0) return;
    const interval = setInterval(() => {
      setActiveSpecialsSlide((prev) => (prev + 1) % aiSpecialsItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isSpecialsHovered, aiSpecialsItems.length]);

  // Compute previous and next special items for adjacent visual peaking
  const { prevSpecialItem, nextSpecialItem } = useMemo(() => {
    if (aiSpecialsItems.length === 0) return { prevSpecialItem: null, nextSpecialItem: null };
    const total = aiSpecialsItems.length;
    const prevIdx = (activeSpecialsSlide - 1 + total) % total;
    const nextIdx = (activeSpecialsSlide + 1) % total;
    return {
      prevSpecialItem: aiSpecialsItems[prevIdx],
      nextSpecialItem: aiSpecialsItems[nextIdx]
    };
  }, [aiSpecialsItems, activeSpecialsSlide]);

  const [aiRecommendations, setAiRecommendations] = useState<MenuItem[]>([]);
  const [aiReason, setAiReason] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  useEffect(() => {
    if (cart.length === 0) {
      setAiRecommendations([]);
      setAiReason('');
      return;
    }

    setIsAiLoading(true);

    // Debounce slightly to simulate smart calculation
    const timer = setTimeout(() => {
      const payload = cart.map(ci => ({
        id: ci.item.id,
        name: ci.item.name,
        category: ci.item.category,
        subcategory: ci.item.subcategory
      }));

      const data = getLocalClientRecommendations(payload);

      const resolved = data.recommendations
        .map((id: string) => MENU_ITEMS.find(it => it.id === id))
        .filter((it: MenuItem | undefined): it is MenuItem => !!it);

      setAiRecommendations(resolved);
      setAiReason(data.reason || '');
      setIsAiLoading(false);
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [cartSerializedIds]);
  
  // State for deletion confirmation
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  
  const confirmDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };
  
  // Slider State for interactive day recommendations
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Daily Recommendations select list that dynamically changes every day depending on the day of the week!
  const dailyRecommendations = useMemo(() => {
    // 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday
    const dayOfWeek = new Date().getDay();
    
    let recIds: string[];
    switch (dayOfWeek) {
      case 1: // Lunes: Energía para iniciar la semana
        recIds = ['hamburguesa-res', 'quesadillas-pollo', 'capuccino-sencillo', 'frappuccino', 'limonada-clasica'];
        break;
      case 2: // Martes: Antojitos crujientes y batidos frescos
        recIds = ['tostones-queso', 'salchipapas', 'dirty-chai-tea', 'batido-fresa', 'limonada-hierbabuena'];
        break;
      case 3: // Miércoles: Platos fuertes a la plancha
        recIds = ['filete-pollo', 'fajitas-mixtas', 'mocaccino', 'frappe-chocolate', 'limonada-frutos-rojos'];
        break;
      case 4: // Jueves: Cortes de carne y frappés especiales
        recIds = ['new-york', 'deditos-pollo-completo', 'capuccino-doble', 'frappe-mani', 'limonada-clasica-frutos-rojos'];
        break;
      case 5: // Viernes: Fin de semana con Rib Eye Premium y frappés dulces
        recIds = ['rib-eye', 'alitas-papas', 'frappe-caramelo', 'frappe-oreo', 'iced-latte-saborizado'];
        break;
      case 6: // Sábado: Platos alegres para compartir
        recIds = ['rib-eye', 'quesadillas-pollo', 'frappe-vainilla', 'batido-blueberry', 'limonada-hierbabuena'];
        break;
      case 0: // Domingo: Especial familiar y relajante de la casa
      default:
        recIds = ['filete-res', 'tostones-queso', 'capuccino-doble', 'frappe-caramelo', 'limonada-frutos-rojos'];
        break;
    }
    
    // Maintain the order of the recIds list
    return MENU_ITEMS.filter(item => recIds.includes(item.id))
      .sort((a, b) => recIds.indexOf(a.id) - recIds.indexOf(b.id));
  }, []);

  // Auto-slide effect for daily recommendations
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % dailyRecommendations.length);
    }, 4000); // fluid interval of 4 seconds
    return () => clearInterval(interval);
  }, [isHovered, dailyRecommendations.length]);

  // UI toast feedback
  const [showNotification, setShowNotification] = useState<{
    type: 'add' | 'remove';
    text: string;
    itemName?: string;
    itemImage?: string;
    itemId?: string;
  } | null>(null);

  // Filtered menu items for search filter with accent-insensitivity and synonym matching
  const itemsFilteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return MENU_ITEMS;
    const normalizedQuery = smartNormalize(searchQuery);
    const extendedTerms = getExtendedSearchTerms(searchQuery);
    
    return MENU_ITEMS.filter((item) => {
      const normalizedName = smartNormalize(item.name);
      const normalizedDesc = smartNormalize(item.description);
      
      return extendedTerms.some(term => 
        normalizedName.includes(term) || 
        normalizedDesc.includes(term) ||
        normalizedQuery.includes(normalizedName) ||
        (term.length > 2 && (normalizedName.includes(term) || normalizedDesc.includes(term)))
      );
    });
  }, [searchQuery]);

  // Grouped items strictly under specified sections
  const menuSections = useMemo(() => {
    const sections = {
      comidas: [
        { id: 'antojitos', label: 'Antojitos de la Casa', items: itemsFilteredBySearch.filter(it => it.category === 'comidas' && it.subcategory === 'antojitos') },
        { id: 'platos_fuertes', label: 'Platos Fuertes', items: itemsFilteredBySearch.filter(it => it.category === 'comidas' && it.subcategory === 'platos_fuertes') },
        { id: 'cortes_premium', label: 'Cortes Premium 🔥', items: itemsFilteredBySearch.filter(it => it.category === 'comidas' && it.subcategory === 'cortes_premium') },
        { id: 'extras', label: 'Extras / Acompañamientos', items: itemsFilteredBySearch.filter(it => it.category === 'comidas' && it.subcategory === 'extras') }
      ],
      bebidas: [
        { id: 'bebidas_calientes', label: 'Bebidas Calientes', items: itemsFilteredBySearch.filter(it => it.category === 'bebidas' && it.subcategory === 'bebidas_calientes') },
        { id: 'bebidas_frias', label: 'Bebidas Frías / Frappés', items: itemsFilteredBySearch.filter(it => it.category === 'bebidas' && it.subcategory === 'bebidas_frias') },
        { id: 'limonadas', label: 'Limonadas Especiales', items: itemsFilteredBySearch.filter(it => it.category === 'bebidas' && it.subcategory === 'limonadas') }
      ],
      postres: [
        { id: 'postres', label: 'Postres & Dulces de la Casa', items: itemsFilteredBySearch.filter(it => it.category === 'postres') }
      ]
    };

    if (searchQuery.trim()) {
      // Reorganize: bring sections with items to the top, empty ones go to the bottom
      sections.comidas = [...sections.comidas].sort((a, b) => {
        const hasA = a.items.length > 0 ? 1 : 0;
        const hasB = b.items.length > 0 ? 1 : 0;
        return hasB - hasA;
      });
      sections.bebidas = [...sections.bebidas].sort((a, b) => {
        const hasA = a.items.length > 0 ? 1 : 0;
        const hasB = b.items.length > 0 ? 1 : 0;
        return hasB - hasA;
      });
      sections.postres = [...sections.postres].sort((a, b) => {
        const hasA = a.items.length > 0 ? 1 : 0;
        const hasB = b.items.length > 0 ? 1 : 0;
        return hasB - hasA;
      });
    }

    return sections;
  }, [itemsFilteredBySearch, searchQuery]);

  // Dynamic list of categories containing sections, calculated so categories with search matches rise to the top
  const categoriesList = useMemo(() => {
    const list = [
      {
        id: 'comidas',
        label: 'COMIDAS',
        icon: '🍱',
        titleBg: 'bg-amber-50',
        titleTextColor: 'text-amber-900',
        subtitle: 'Artesanía de Sabor',
        sections: menuSections.comidas,
        itemCount: menuSections.comidas.reduce((acc, sec) => acc + sec.items.length, 0)
      },
      {
        id: 'bebidas',
        label: 'BEBIDAS',
        icon: '☕',
        titleBg: 'bg-rose-50',
        titleTextColor: 'text-rose-900',
        subtitle: 'Cafetería & Limonadas',
        sections: menuSections.bebidas,
        itemCount: menuSections.bebidas.reduce((acc, sec) => acc + sec.items.length, 0)
      },
      {
        id: 'postres',
        label: 'POSTRES',
        icon: '🍰',
        titleBg: 'bg-amber-50/70',
        titleTextColor: 'text-[#A0701F]',
        subtitle: 'Tentaciones Dulces del Día',
        sections: menuSections.postres,
        itemCount: menuSections.postres.reduce((acc, sec) => acc + sec.items.length, 0)
      }
    ];

    if (searchQuery.trim()) {
      // Sort categories so that the one with active matching items appears at the top
      list.sort((a, b) => {
        const hasA = a.itemCount > 0 ? 1 : 0;
        const hasB = b.itemCount > 0 ? 1 : 0;
        if (hasA !== hasB) {
          return hasB - hasA; // has matches comes first
        }
        return b.itemCount - a.itemCount; // tie breaker: more matching items comes first
      });
    }

    return list;
  }, [menuSections, searchQuery]);

  // Slide navigation
  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % dailyRecommendations.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + dailyRecommendations.length) % dailyRecommendations.length);
  };

  // Scroll to targeted element ID smoothly
  const handleScrollToSegment = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const mainHeader = document.getElementById('main-header');
      const categoryHeader = document.getElementById('category-header');
      
      let offset = 136; // Ideal default matching cumulative bar height
      if (mainHeader && categoryHeader) {
        // Dynamically compute the total sticky header height (with a small 6px safety gap)
        offset = mainHeader.offsetHeight + categoryHeader.offsetHeight + 6;
      } else if (mainHeader) {
        offset = mainHeader.offsetHeight + 6;
      }

      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Cart Functions
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex(ci => ci.item.id === item.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { item, quantity: 1, notes: '' }];
    });

    // Run custom micro-animations
    setLastAddedId(item.id);
    setCartAnimationTrigger(true);
    setTimeout(() => setCartAnimationTrigger(false), 500);
    // Reset the badge timer
    setTimeout(() => {
      setLastAddedId((curr) => curr === item.id ? null : curr);
    }, 1000);

    setShowNotification({
      type: 'add',
      text: '¡Se añadió al carrito! 🌸',
      itemName: item.name,
      itemImage: item.image,
      itemId: item.id
    });
    setTimeout(() => setShowNotification(null), 2500);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const idx = prev.findIndex(ci => ci.item.id === itemId);
      if (idx !== -1) {
        const next = [...prev];
        const newQty = next[idx].quantity + delta;
        if (newQty < 1) {
          return prev.filter(ci => ci.item.id !== itemId);
        }
        next[idx] = { ...next[idx], quantity: newQty };
        return next;
      }
      return prev;
    });
  };

  const updateNotes = (itemId: string, notes: string) => {
    setCart((prev) => prev.map((ci) => ci.item.id === itemId ? { ...ci, notes } : ci));
  };

  const removeFromCart = (itemId: string) => {
    const targetItem = cart.find(ci => ci.item.id === itemId);
    setCart((prev) => prev.filter(ci => ci.item.id !== itemId));
    
    if (targetItem) {
      setShowNotification({
        type: 'remove',
        text: `Se quitó ${targetItem.item.name} del pedido`
      });
      setTimeout(() => setShowNotification(null), 2000);
    }
  };

  // Cart Summary Math
  const totalCartCount = useMemo(() => {
    return cart.reduce((tot, ci) => tot + ci.quantity, 0);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return cart.reduce((tot, ci) => tot + (ci.item.price * ci.quantity), 0);
  }, [cart]);

  // Delivery fee estimation inside Waslala (C$ 35 for delivery, C$ 0 for pick up)
  const deliveryFee = useMemo(() => {
    if (cart.length === 0) return 0;
    return deliveryType === 'delivery' ? 35 : 0;
  }, [cart, deliveryType]);

  const grandTotalPrice = useMemo(() => {
    return totalCartPrice + deliveryFee;
  }, [totalCartPrice, deliveryFee]);

  // Smart dynamic suggestions (Maridaje) based on current items in the cart
  const recommendedPairings = useMemo(() => {
    if (cart.length === 0) return [];

    const hasComidas = cart.some(ci => ci.item.category === 'comidas');
    const hasBebidas = cart.some(ci => ci.item.category === 'bebidas');
    const hasPremiumCuts = cart.some(ci => ['rib-eye', 'new-york'].includes(ci.item.id));
    const hasWarmCoffee = cart.some(ci => ci.item.subcategory === 'bebidas_calientes');
    const hasOnlyDrinks = hasBebidas && !hasComidas;
    const hasOnlyFoods = hasComidas && !hasBebidas;
    const cartIds = cart.map(ci => ci.item.id);

    let candidateIds: string[] = [];

    if (hasPremiumCuts) {
      // Premium cuts call for premium cold beverages
      candidateIds = ['limonada-frutos-rojos', 'limonada-hierbabuena', 'iced-latte-saborizado'];
    } else if (hasOnlyFoods) {
      // Foods only: recommend ideal drinks
      if (cart.some(ci => ['hamburguesa-res', 'salchipapas', 'alitas-papas'].includes(ci.item.id))) {
        candidateIds = ['limonada-hierbabuena', 'frappe-caramelo', 'limonada-clasica-frutos-rojos'];
      } else {
        candidateIds = ['capuccino-sencillo', 'limonada-clasica', 'americano'];
      }
    } else if (hasOnlyDrinks) {
      // Drinks only: recommend snacks
      if (hasWarmCoffee) {
        candidateIds = ['tostones-queso', 'quesadillas-pollo'];
      } else {
        candidateIds = ['tostones-queso', 'salchipapas', 'extra-papas'];
      }
    } else {
      // Both: recommend a side or sweet treat
      candidateIds = ['extra-tostones', 'frappe-oreo', 'extra-papas'];
    }

    // Filter out candidates already in the cart
    let filteredCandidates = candidateIds.filter(id => !cartIds.includes(id));

    // Get matching items
    let recommended = MENU_ITEMS.filter(it => filteredCandidates.includes(it.id));

    // If we have fewer than 2 recommendations, add high-quality backup items
    if (recommended.length < 2) {
      const backups = ['tostones-queso', 'limonada-hierbabuena', 'frappe-oreo', 'extra-papas'];
      for (const id of backups) {
        if (!cartIds.includes(id) && !recommended.some(it => it.id === id)) {
          const item = MENU_ITEMS.find(it => it.id === id);
          if (item) recommended.push(item);
        }
        if (recommended.length >= 2) break;
      }
    }

    return recommended.slice(0, 2);
  }, [cart]);

  const pairingsToDisplay = useMemo(() => {
    return aiRecommendations.length > 0 ? aiRecommendations : recommendedPairings;
  }, [aiRecommendations, recommendedPairings]);

  const pairingReasonToDisplay = useMemo(() => {
    if (aiReason) return aiReason;
    
    const hasComidas = cart.some(ci => ci.item.category === 'comidas');
    const hasBebidas = cart.some(ci => ci.item.category === 'bebidas');
    const hasPremiumCuts = cart.some(ci => ['rib-eye', 'new-york'].includes(ci.item.id));
    
    if (hasPremiumCuts) {
      return "💡 Recomendación Gourmet: Estos elixires fríos resaltan la jugosidad premium de tu corte de carne.";
    }
    if (hasComidas && !hasBebidas) {
      return "🍹 ¡Completa tu comida con la bebida o elixir ideal de la casa!";
    }
    if (!hasComidas && hasBebidas) {
      return "🥐 ¿Un delicioso platillo Waslaleño para acompañar tu taza o frappé?";
    }
    return "✨ El toque final perfecto preferido por nuestros clientes de Amor y Café.";
  }, [aiReason, cart]);

  const isAiSourced = aiRecommendations.length > 0;

  // Dispatch message to WhatsApp (+505 7788 7330)
  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;

    let text = `*☕ ¡Hola, Amor y Café! Gusto en saludarte. Me gustaría registrar el siguiente pedido:* \n\n`;
    text += `👤 *Cliente:* ${customerName.trim() || 'Invitado'}\n`;
    text += `📍 *Método de entrega:* ${deliveryType === 'delivery' ? `🛵 Envío a Domicilio (Waslala)` : `🛍️ Retiro en Local / Para Llevar`}\n`;
    
    if (addressOrTime.trim()) {
      if (deliveryType === 'delivery') {
        text += `🏠 *Dirección de entrega:* ${addressOrTime.trim()}\n`;
      } else {
        text += `🕒 *Hora estimada de retiro:* ${addressOrTime.trim()}\n`;
      }
    } else {
      text += `🏠 *Dirección/Hora:* No especificado\n`;
    }
    
    text += `──────────────────\n\n`;

    cart.forEach((cartItem, index) => {
      text += `${index + 1}️⃣  *${cartItem.quantity}x* ${cartItem.item.name} (~C$ ${cartItem.item.price} c/u~)\n`;
      if (cartItem.notes?.trim()) {
        text += `     _Nota:_ "${cartItem.notes.trim()}"\n`;
      }
      text += `     *Subtotal:* C$ ${cartItem.item.price * cartItem.quantity}\n`;
    });

    text += `\n──────────────────\n`;
    if (orderNotes.trim()) {
      text += `📝 *Observaciones adicionales:* "${orderNotes.trim()}"\n`;
    }

    text += `💵 *Subtotal:* C$ ${totalCartPrice}\n`;
    if (deliveryType === 'delivery') {
      text += `🛵 *Costo de envío:* C$ ${deliveryFee}\n`;
    }
    text += `💰 *TOTAL A PAGAR:* C$ ${grandTotalPrice}\n\n`;
    text += `⏰ _Pedido hecho desde el Menú Interactivo de Amor y Café._\n¿Me confirmarían la preparación, por favor?`;

    const targetPhone = '50577887330'; // El número solicitado: +505 7788 7330
    const cleanUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
    window.open(cleanUrl, '_blank');

    // Vaciar el carrito y las notas del pedido actual para el próximo pedido
    setCart([]);
    setOrderNotes('');
    setIsCartOpen(false);

    // Conservar la dirección predeterminada o restaurarla si se usó la modalidad de retirar/llevar
    if (deliveryType === 'llevar') {
      const savedAddress = localStorage.getItem('amor_y_cafe_default_address') || '';
      setAddressOrTime(savedAddress);
      setDeliveryType('delivery'); // Volver a servicio a domicilio predeterminado
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2F1F17] font-sans antialiased relative selection:bg-rose-100 selection:text-rose-900">
      
      {/* Elegantes Elementos Flotantes de Fondo Auténticos (vibe café, amor, elegancia) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
        {/* Pétalos y Rosas */}
        <div className="absolute top-44 left-10 opacity-30 animate-float-gentle text-xl">🌸</div>
        <div className="absolute top-96 right-16 opacity-35 animate-float-gentle text-base animate-delay-1000">🌸</div>
        <div className="absolute top-[60vh] left-1/4 opacity-25 animate-float-gentle text-lg">💮</div>
        <div className="absolute top-[120vh] right-10 opacity-20 animate-float-gentle text-xl">🌹</div>
        <div className="absolute bottom-[80vh] left-12 opacity-30 animate-float-gentle text-lg">🌸</div>
        <div className="absolute bottom-40 right-20 opacity-25 animate-float-gentle text-base">💮</div>
        
        {/* Café e Inspiraciones */}
        <div className="absolute top-32 right-1/4 opacity-20 animate-float text-lg">☕</div>
        <div className="absolute top-[80vh] left-8 opacity-20 animate-float text-xl">☕</div>
        <div className="absolute top-[150vh] right-[15vw] opacity-15 animate-float text-lg">☕</div>
        <div className="absolute bottom-[140vh] left-[20vw] opacity-25 animate-float text-xl">☕</div>
        
        {/* Corazones gentiles (Amor) */}
        <div className="absolute top-64 left-[15vw] opacity-25 animate-float-gentle text-xs">💖</div>
        <div className="absolute top-[105vh] right-[25vw] opacity-20 animate-float-gentle text-sm">💝</div>
        <div className="absolute top-[190vh] left-1/3 opacity-15 animate-float-gentle text-xs">💖</div>
        <div className="absolute bottom-96 right-1/3 opacity-25 animate-float-gentle text-sm">💖</div>

        {/* Partículas Drift Continuas que flotan de abajo hacia arriba */}
        <div className="absolute bottom-10 left-[8%] opacity-20 animate-float-sway text-xs">☕</div>
        <div className="absolute bottom-20 right-[12%] opacity-15 animate-float-sway text-xs">💖</div>
        <div className="absolute bottom-40 left-[45%] opacity-20 animate-float-sway text-xs">🌸</div>
        <div className="absolute bottom-60 right-[35%] opacity-15 animate-float-sway text-xs">☕</div>
        <div className="absolute bottom-5 left-[25%] opacity-20 animate-float-sway text-xs">💖</div>
      </div>

      {/* Notificador Interactivo Elegante en la Parte Superior (No bloqueante) */}
      <AnimatePresence>
        {showNotification && (
          showNotification.type === 'add' ? (
            <div className="fixed top-24 left-0 right-0 z-[110] flex justify-center px-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { type: "spring", damping: 15, stiffness: 220 }
                }}
                exit={{ 
                  opacity: 0, 
                  y: -35, 
                  scale: 0.95,
                  transition: { duration: 0.2 } 
                }}
                className="bg-[#FDFBF7] text-[#2F1F17] p-3.5 md:p-4 rounded-3xl border border-[#FAEDE0] shadow-[0_20px_45px_-10px_rgba(47,31,23,0.18)] flex items-center gap-3.5 max-w-md w-full pointer-events-auto overflow-hidden neon-text-glow shadow-rose-200/10"
              >
                {/* Sutil gradiente de destello interior */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50/20 via-transparent to-amber-50/10 pointer-events-none" />
                
                {/* Logo de Amor y Café en la notificación */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-rose-300 shadow-xs bg-white">
                  <img 
                    referrerPolicy="no-referrer" 
                    src={logoAmorYCafe} 
                    alt="Amor y Café Logo" 
                    className="w-full h-full object-cover" 
                  />
                  {/* Micro estrella en la esquina de la miniatura */}
                  <div className="absolute -bottom-0.5 -right-0.5 bg-amber-400 text-stone-900 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] border border-[#FDFBF7] select-none">
                    ✨
                  </div>
                </div>

                {/* Información textual elegante */}
                <div className="flex-1 text-left min-w-0 pr-2">
                  <span className="block font-mono text-[9px] font-black tracking-[0.15em] text-rose-500 uppercase leading-none mb-1">
                    {showNotification.text}
                  </span>
                  <h4 className="font-serif font-black text-sm text-[#2F1F17] truncate leading-tight">
                    {showNotification.itemName}
                  </h4>
                  <p className="font-sans text-[10px] text-stone-500 leading-normal font-light truncate mt-0.5">
                    ¡Sabor exquisito directo a tu bolsa! 🌸
                  </p>
                </div>

                {/* Botón de cierre sutil */}
                <button 
                  onClick={() => setShowNotification(null)}
                  className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-[#2F1F17] transition-all shrink-0 cursor-pointer animate-none"
                  aria-label="Cerrar notificación"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </div>
          ) : (
            /* Toast minimalista y sutil para la acción de eliminar un producto */
            <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.15 } }}
                className="bg-[#2F1F17] text-[#FAF8F5] px-5 py-3 rounded-2xl text-xs font-semibold tracking-wide shadow-2xl border border-stone-800 flex items-center gap-2 max-w-sm text-center pointer-events-auto"
              >
                <Trash2 className="w-4 h-4 text-rose-300 shrink-0 select-none animate-pulse" />
                <span>{showNotification.text}</span>
              </motion.div>
            </div>
          )
        )}
      </AnimatePresence>

      {/* BARRA DE NAVEGACIÓN Y LOGOTIPO DE ALTA CALIDAD */}
      <nav id="main-header" className="sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#F4EBE0]/75 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          
          {/* Logotipo Centralizado de la marca */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#F4EBE0] bg-white flex items-center justify-center shadow-md shrink-0 transition-transform hover:scale-105 duration-300">
              <img 
                src={logoAmorYCafe} 
                alt="Amor y Café Logo" 
                className="w-full h-full object-cover scale-105" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="leading-none">
              <h1 className="font-serif text-2xl font-black tracking-tight text-[#4E5B6A]">
                Amor & Café
              </h1>
              <span className="block text-[9px] font-mono tracking-widest text-[#AF9C89] uppercase font-bold mt-0.5">Waslala, Nicaragua</span>
            </div>
          </div>

          {/* Menú de categorías desktop */}
          <div className="hidden md:flex items-center gap-8 text-[#4E5B6A] text-xs font-bold tracking-wider uppercase">
            <button onClick={() => handleScrollToSegment('antojitos')} className="hover:text-rose-500 transition-colors cursor-pointer">Comidas</button>
            <button onClick={() => handleScrollToSegment('bebidas_calientes')} className="hover:text-rose-400 transition-colors cursor-pointer">Bebidas</button>
            <span className="text-[#E2D9D0]">|</span>
            <span className="flex items-center gap-1 text-emerald-600 font-mono text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Pedidos vía WhatsApp
            </span>
          </div>

          {/* Botones de acción en la Esquina Superior Derecha sin botón de bolsa */}
          <div className="flex items-center gap-2">
            {/* Botón de Menú de Hamburguesa (Menú Lateral Derecho) */}
            <button 
              onClick={() => setIsContactOpen(true)}
              className="p-2.5 bg-white hover:bg-[#2F1F17] hover:text-[#FDFBF7] text-[#4E5B6A] border border-[#EBE3D5] hover:border-[#2F1F17] rounded-full transition-all cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-center group"
              aria-label="Abrir menú de navegación"
              id="hamburger-menu-btn"
            >
              <Menu className="w-5 h-5 group-hover:scale-105 transition-transform text-[#4E5B6A] group-hover:text-inherit" />
            </button>
          </div>

        </div>
      </nav>

      {/* CABECERA / BIENVENIDA LIMPIA */}
      <header className="relative py-14 px-4 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#4E5B6A] leading-tight tracking-tight">
          Sabor que <span className="text-rose-400 font-serif italic neon-text-glow">enamora</span>,<br/>
          café que <span className="underline decoration-[#4E5B6A]/20 italic text-[#2F1F17]">inspira</span>
        </h2>

        <p className="text-sm sm:text-base text-[#5A493B] font-light max-w-xl mx-auto leading-relaxed">
          Bienvenido a <strong className="font-serif font-bold text-[#4E5B6A]">Amor y Café</strong>. Una propuesta gastronómica única y acogedora en el corazón de Waslala. Delicadas notas florales de rosas y flores blancas perfuman el aroma de platillos cocinados al momento y nuestra exclusiva cafetería fina.
        </p>
      </header>

      {/* SECCIÓN: SUGERENCIAS SELECTAS DE LA CASA */}
      <section className="bg-[#FAF6EE] border-y border-[#F3ECE0] py-12 relative z-10 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Header de Ofertas Especiales */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-black tracking-widest uppercase text-stone-500 flex items-center justify-center gap-1.5 bg-white border border-[#EBE3D5] px-3.5 py-1.5 rounded-full w-max mx-auto shadow-2xs">
              ☕ Recetas Artesanales de la Casa
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#4E5B6A] tracking-tight">
              Recomendación especial de hoy
            </h3>
            <p className="text-xs text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
              Descubre las creaciones sugeridas por nuestro chef cocinadas hoy al momento con ingredientes frescos del norte.
            </p>
          </div>

          {/* Resultado en forma de carrusel deslizable con soporte de gestos */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isAiSpecialsLoading ? (
                /* Sleek shimmer loader matching the slider size */
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm max-w-3xl mx-auto animate-pulse flex flex-col md:flex-row gap-6 h-[400px] md:h-[300px]"
                >
                  <div className="w-full md:w-1/2 bg-stone-200 rounded-2xl h-1/2 md:h-full shrink-0" />
                  <div className="w-full md:w-1/2 space-y-4 py-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="h-3 bg-stone-200 rounded-md w-1/4" />
                      <div className="h-5 bg-stone-250 rounded-md w-3/4" />
                      <div className="h-3 bg-stone-200 rounded-md w-full" />
                      <div className="h-3 bg-stone-200 rounded-md w-5/6" />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <div className="h-4 bg-stone-250 rounded-md w-1/4" />
                      <div className="h-8 bg-stone-250 rounded-md w-1/3" />
                    </div>
                  </div>
                </motion.div>
              ) : aiSpecialsItems.length > 0 ? (
                /* Contenedor del Carrusel del menú inteligente */
                <div 
                  className="max-w-xl mx-auto relative group pb-10 px-6 sm:px-0"
                  onMouseEnter={() => setIsSpecialsHovered(true)}
                  onMouseLeave={() => setIsSpecialsHovered(false)}
                >
                  {/* Tarjeta de previsualización Izquierda (Detrás a la par) */}
                  {prevSpecialItem && (
                    <div className="absolute right-[96%] sm:right-[103%] top-4 bottom-14 w-[50px] sm:w-[260px] bg-white border border-[#FAEDE0] rounded-3xl overflow-hidden opacity-30 scale-[0.88] origin-right pointer-events-none select-none z-0 flex shadow-3xs transition-all duration-300">
                      <div className="w-full h-full relative">
                        <img 
                          src={prevSpecialItem.image} 
                          alt={prevSpecialItem.name} 
                          className="w-full h-full object-cover grayscale-[20%]" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2F1F17]/90 via-[#2F1F17]/35 to-transparent p-4 text-white hidden sm:block">
                          <span className="block text-[7px] font-mono uppercase tracking-wider text-stone-300 leading-none mb-1">
                            {SUBCATEGORIES_LABELS[prevSpecialItem.subcategory] || "Especial"}
                          </span>
                          <h5 className="font-serif text-xs font-black truncate max-w-full">
                            {prevSpecialItem.name}
                          </h5>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tarjeta de previsualización Derecha (Detrás a la par) */}
                  {nextSpecialItem && (
                    <div className="absolute left-[96%] sm:left-[103%] top-4 bottom-14 w-[50px] sm:w-[260px] bg-white border border-[#FAEDE0] rounded-3xl overflow-hidden opacity-30 scale-[0.88] origin-left pointer-events-none select-none z-0 flex shadow-3xs transition-all duration-300">
                      <div className="w-full h-full relative">
                        <img 
                          src={nextSpecialItem.image} 
                          alt={nextSpecialItem.name} 
                          className="w-full h-full object-cover grayscale-[20%]" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2F1F17]/90 via-[#2F1F17]/35 to-transparent p-4 text-white hidden sm:block">
                          <span className="block text-[7px] font-mono uppercase tracking-wider text-stone-300 leading-none mb-1">
                            {SUBCATEGORIES_LABELS[nextSpecialItem.subcategory] || "Especial"}
                          </span>
                          <h5 className="font-serif text-xs font-black truncate max-w-full">
                            {nextSpecialItem.name}
                          </h5>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Slider de Tarjetas split (Forma vertical en móvil, Split a los lados en desktop; diseñado a una escala moderada y compacta) */}
                  <motion.div 
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.5}
                    onDragEnd={(event, info) => {
                      const swipeThreshold = 55;
                      if (info.offset.x < -swipeThreshold) {
                        // Swipe izquierda -> Siguiente platillo
                        setActiveSpecialsSlide((prev) => (prev + 1) % aiSpecialsItems.length);
                      } else if (info.offset.x > swipeThreshold) {
                        // Swipe derecha -> Platillo anterior
                        setActiveSpecialsSlide((prev) => (prev - 1 + aiSpecialsItems.length) % aiSpecialsItems.length);
                      }
                    }}
                    whileTap={{ cursor: 'grabbing' }}
                    className="bg-white rounded-3xl border border-[#FAEDE0] overflow-hidden shadow-sm hover:shadow-md transition-all relative flex flex-col sm:flex-row h-[480px] xs:h-[440px] sm:h-[350px] md:h-[365px] lg:h-[345px] cursor-grab select-none active:cursor-grabbing touch-pan-y z-10"
                  >
                    
                    {/* Sección Fotografía: Banner cinemático comprimido en móvil, split exacto en tablets/desktop */}
                    <div className="w-full sm:w-[42%] md:w-1/2 h-44 sm:h-full overflow-hidden bg-stone-100 relative shrink-0">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={aiSpecialsItems[activeSpecialsSlide].id}
                          src={aiSpecialsItems[activeSpecialsSlide].image}
                          alt={aiSpecialsItems[activeSpecialsSlide].name}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.4 }}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover pointer-events-none absolute inset-0"
                        />
                      </AnimatePresence>
                    </div>
 
                    {/* Sección Detalles: Súper balanceados y legibles */}
                    <div className="flex-1 p-5 xs:p-6 md:p-8 flex flex-col justify-between text-left space-y-3 sm:space-y-4 min-w-0">
                      
                      {/* Contenedor de contenido de texto con espacio/altura estables para evitar saltos internos */}
                      <div className="flex-1 flex flex-col justify-start relative min-h-0 overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={aiSpecialsItems[activeSpecialsSlide].id}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-2 sm:space-y-3 flex-1 flex flex-col justify-start"
                          >
                            <div className="flex items-center justify-between">
                              <span className="block text-[8px] xs:text-[9px] font-mono font-bold uppercase tracking-wider text-[#AF9C89] leading-none">
                                {SUBCATEGORIES_LABELS[aiSpecialsItems[activeSpecialsSlide].subcategory] || "Especial de la Casa"}
                              </span>
                            </div>
                            
                            <h4 className="font-serif text-sm xs:text-base sm:text-lg md:text-xl font-black text-[#2F1F17] leading-tight line-clamp-1 xs:line-clamp-2">
                              {aiSpecialsItems[activeSpecialsSlide].name}
                            </h4>
                            
                            <p className="text-[10px] xs:text-[11px] sm:text-xs text-[#5A493B] font-light leading-relaxed line-clamp-2 md:line-clamp-3">
                              {aiSpecialsItems[activeSpecialsSlide].description}
                            </p>
   
                            {/* Explicación del Maridaje o Inspiración */}
                            <div className="bg-[#FAF6EE] border border-[#FAEDE0] p-2.5 sm:p-3 rounded-xl space-y-0.5 sm:space-y-1 relative overflow-hidden">
                              <span className="block text-[7px] xs:text-[8px] font-extrabold text-rose-500 uppercase tracking-widest leading-none">
                                ✨ Inspiración: {aiSpecialsTheme}
                              </span>
                              <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-[#5A493B] italic leading-relaxed font-serif font-medium line-clamp-2">
                                &ldquo;{aiSpecialsExplanation}&rdquo;
                              </p>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
 
                      <div className="pt-2.5 xs:pt-3 border-t border-stone-100/70 flex items-center justify-between gap-3 sm:gap-4 shrink-0">
                        <div className="space-y-0.5">
                          <span className="block text-[7px] xs:text-[8px] uppercase tracking-wider font-mono text-stone-400 font-bold leading-none">Precio especial</span>
                          <span className="text-xs xs:text-sm sm:text-base md:text-lg font-black font-mono text-rose-500 leading-none">
                            C$ {aiSpecialsItems[activeSpecialsSlide].price}
                          </span>
                        </div>
 
                        <button
                          onClick={() => addToCart(aiSpecialsItems[activeSpecialsSlide])}
                          className="px-3 py-1.5 xs:px-4 xs:py-2 bg-[#2F1F17] hover:bg-rose-500 text-white font-bold rounded-xl text-[9px] xs:text-[10px] tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 group shadow-2xs hover:shadow-xs active:scale-[0.98]"
                        >
                          <span>Añadir al pedido</span>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
 
                    </div>
                  </motion.div>

                  {/* Bullet / Dot Pager underneath */}
                  <div className="mt-4 flex justify-center gap-1.5">
                    {aiSpecialsItems.map((_, i) => (
                      <button
                        key={`specials-dot-${i}`}
                        onClick={() => setActiveSpecialsSlide(i)}
                        className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${activeSpecialsSlide === i ? 'bg-[#2F1F17] w-6' : 'bg-stone-200 hover:bg-stone-300'}`}
                        aria-label={`Ir al platillo ${i + 1}`}
                      />
                    ))}
                  </div>

                </div>
              ) : (
                /* Fallback text if something loads blankly */
                <p className="text-stone-400 text-xs italic">Sugerencias no disponibles temporalmente.</p>
              )}
            </AnimatePresence>

          </div>

        </div>
      </section>

      {/* STRIP DE CONTROLADORAS STICKY DE CATEGORÍA */}
      <div id="category-header" className="sticky top-[72px] bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#F4EBE0]/60 py-3 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Categorías deslizables */}
          <div className="flex items-center gap-2 overflow-x-auto w-full no-scrollbar pb-1 md:pb-0 flex-nowrap">
            
            <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-[#F4EBE0]/70 text-[10px] font-black uppercase text-[#AF9C89] tracking-wider">
              <span className="text-xs">🍱</span> Comidas:
            </div>
            {menuSections.comidas.map((sec) => (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={sec.id}
                onClick={() => handleScrollToSegment(sec.id)}
                className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#FAF1EC] border border-[#EBE3D5] hover:border-[#F2D6C4] text-xs font-semibold rounded-full text-[#5A493B] hover:text-[#C55D21] transition-all duration-500 ease-in-out cursor-pointer whitespace-nowrap shrink-0"
              >
                {sec.label}
              </motion.button>
            ))}

            <div className="flex items-center gap-1.5 shrink-0 pl-3 pr-3 border-l border-r border-[#F4EBE0]/70 text-[10px] font-black uppercase text-[#AF9C89] tracking-wider ml-2">
              <span className="text-xs">☕</span> Bebidas:
            </div>
            {menuSections.bebidas.map((sec) => (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={sec.id}
                onClick={() => handleScrollToSegment(sec.id)}
                className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#FDF2F4] border border-[#EBE3D5] hover:border-[#ECC4CD] text-xs font-semibold rounded-full text-[#5A493B] hover:text-[#D14660] transition-all duration-500 ease-in-out cursor-pointer whitespace-nowrap shrink-0"
              >
                {sec.label}
              </motion.button>
            ))}

            <div className="flex items-center gap-1.5 shrink-0 pl-3 pr-3 border-l border-[#F4EBE0]/70 text-[10px] font-black uppercase text-[#AF9C89] tracking-wider ml-2">
              <span className="text-xs">🍰</span> Postres:
            </div>
            {menuSections.postres.map((sec) => (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={sec.id}
                onClick={() => handleScrollToSegment(sec.id)}
                className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#FDF9F0] border border-[#EBE3D5] hover:border-[#EED5AA] text-xs font-semibold rounded-full text-[#5A493B] hover:text-[#A0701F] transition-all duration-500 ease-in-out cursor-pointer whitespace-nowrap shrink-0"
              >
                {sec.label}
              </motion.button>
            ))}

          </div>

          {/* Buscador de Cartas */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AF9C89]" />
            <input 
              type="text"
              placeholder="Buscar plato en carta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-[#FAF8F5] border border-[#EBE3D5] rounded-full py-1.5 pl-9 pr-6 text-xs focus:outline-none focus:ring-1 focus:ring-rose-400 focus:bg-white text-[#2F1F17]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* MENÚ DE SECCIONES (AESTHETIC GRID) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {categoriesList.map((category) => (
          <div key={category.id} className="space-y-12">
            
            <div className="border-b-2 border-[#EBE3D5] pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`p-2 ${category.titleBg} ${category.titleTextColor} rounded-2xl font-bold text-lg`}>
                  {category.icon}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#505A69] tracking-tight">
                  {category.label}
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#AF9C89] font-bold">
                {category.subtitle}
              </span>
            </div>

            {category.sections.map((section) => (
              <div key={section.id} id={section.id} className="space-y-6 scroll-mt-28">
                
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-rose-400 rounded"></span>
                  <h4 className="font-serif text-lg font-bold text-[#2F1F17]">{section.label}</h4>
                </div>

                {section.items.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No hay productos que coincidan en esta categoría.</p>
                ) : (
                  <motion.div 
                    variants={entranceContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  >
                    {section.items.map((item) => {
                      const cartItem = cart.find(ci => ci.item.id === item.id);
                      return (
                        <motion.div 
                          layout
                          variants={entranceItemVariants}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={item.id}
                          className="bg-white rounded-3xl border border-[#F4EBE0]/75 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-rose-300/30 transition-all duration-300 relative group h-full"
                        >
                          {/* Cabecera Visual Completa (Estilo Tarjeta de Catálogo Tradicional) */}
                          <div className="relative h-44 w-full bg-[#FAF8F5] overflow-hidden border-b border-[#F4EBE0]/50">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-3">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <h5 className="font-serif text-[15px] font-black text-[#2F1F17] group-hover:text-rose-500 transition-colors leading-tight">
                                  {item.name}
                                </h5>
                                <span className="font-serif text-sm font-bold text-[#2F1F17] shrink-0 font-mono tracking-tight bg-[#FAF8F5] px-2 py-0.5 rounded-lg border border-[#F1E9DC]">
                                  C$ {item.price}
                                </span>
                              </div>
                              
                              <p className="text-xs text-[#5A493B] font-light leading-relaxed line-clamp-2">
                                {item.description}
                              </p>

                              {/* Float upward bubble animation */}
                              <AnimatePresence>
                                {lastAddedId === item.id && (
                                  <motion.span
                                    initial={{ opacity: 1, y: 0, scale: 0.7 }}
                                    animate={{ opacity: 0, y: -65, scale: 1.3, rotate: [0, -12, 12, 0] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.75, ease: "easeOut" }}
                                    className="absolute right-6 bottom-14 bg-rose-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full z-10 shadow-md pointer-events-none"
                                  >
                                    +1 🛍️
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className="pt-3 border-t border-[#FBF8F2] flex items-center justify-end">
                              {cartItem ? (
                                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-full px-2.5 py-1">
                                  <button 
                                    onClick={() => {
                                      if (cartItem.quantity === 1) {
                                        setItemToDelete(item);
                                      } else {
                                        updateQuantity(item.id, -1);
                                      }
                                    }}
                                    className="p-1 hover:bg-stone-200 rounded-full text-stone-600 hover:text-red-600 transition-all cursor-pointer flex items-center justify-center"
                                    aria-label="Disminuir"
                                  >
                                    <Minus className="w-3.5 h-3.5 text-stone-600" />
                                  </button>
                                  <span className="font-mono text-xs font-bold text-[#2F1F17] w-6 text-center select-none">{cartItem.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="p-1 hover:bg-stone-200 rounded-full text-stone-600 hover:text-emerald-600 transition-all cursor-pointer flex items-center justify-center"
                                    aria-label="Aumentar"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-stone-600" />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => addToCart(item)}
                                  className="px-4 py-2 bg-[#FEE2E2]/60 hover:bg-[#2F1F17] text-rose-700 hover:text-[#FDFBF7] rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border border-rose-100"
                                >
                                  <span>[Agregar +]</span>
                                </button>
                              )}
                            </div>
                          </div>

                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

              </div>
            ))}
          </div>
        ))}
      </main>

      {/* AMBIENTE ACOGEDOR BRANDING BLOCK */}
      <section className="bg-gradient-to-r from-rose-50/20 via-rose-50/50 to-rose-50/20 py-16 border-t border-[#F4EBE0]/70 text-center select-none">
        <div className="max-w-xl mx-auto px-6 space-y-4">
          <span className="text-2xl">🌸</span>
          <h3 className="font-serif text-2xl font-black text-[#4E5B6A]">Atmósfera de Bienestar</h3>
          <p className="text-xs sm:text-sm text-[#5A493B] font-light leading-relaxed">
            Te invitamos a visitarnos para experimentar la combinación perfecta de luces cálidas, música sutil y hermosos ramos de rosas y flores blancas que transforman cada taza en un momento de relajación absoluto.
          </p>
          <div className="text-[10px] font-mono tracking-widest text-[#AF9C89] uppercase font-bold pt-3">
            Amor & Café • Waslala
          </div>
        </div>
      </section>

      {/* BARRA FIJA INFERIOR - INFORMACIÓN DEL PEDIDO Y CHECKOUT */}
      <AnimatePresence>
        {!isSearchFocused && (
          <div className="fixed bottom-5 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
            <motion.div
              initial={{ y: 55, opacity: 0 }}
              animate={cartAnimationTrigger ? { scale: [1, 1.06, 0.98, 1.01, 1], y: [0, -10, 2, -1, 0], opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
              exit={{ y: 65, opacity: 0, transition: { duration: 0.22 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="pointer-events-auto w-full max-w-md md:max-w-xl bg-gradient-to-r from-[#211510] to-[#2F1F17] text-[#FAF8F5] py-3 px-4 sm:px-6 rounded-full shadow-[0_12px_40px_rgba(47,31,23,0.4)] border border-[#E4D1B9]/25"
            >
              <div 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Información Crucial del Pedido */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-11 h-11 rounded-full bg-stone-900/80 flex items-center justify-center text-rose-300 border border-stone-800 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <ShoppingBag className="w-5 h-5 text-rose-400" />
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={totalCartCount}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-br from-rose-400 to-rose-500 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border border-[#2F1F17] shadow-md"
                      >
                        {totalCartCount}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  
                  <div className="text-left min-w-0">
                    <span className="block font-serif font-black text-sm sm:text-base text-white tracking-wide leading-tight">
                      Tu Pedido Listo
                    </span>
                    <p className="font-mono text-xs text-stone-300 mt-0.5 whitespace-nowrap">
                      Consumo: <span className="font-bold text-rose-300">C$ {totalCartPrice}</span>
                    </p>
                  </div>
                </div>

                {/* Botón para redireccionar al Modal */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCartOpen(true);
                  }}
                  className="bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white font-serif font-semibold px-5 sm:px-6 py-2 sm:py-2.5 rounded-full flex items-center gap-2 shadow-md shadow-rose-500/10 hover:shadow-rose-500/30 transition-all duration-300 cursor-pointer text-xs sm:text-sm tracking-wide shrink-0"
                >
                  <span>Ver Pedido</span>
                  <span className="font-serif leading-none text-sm">➔</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VENTANA MODAL EMERGENTE Y MINIMALISTA DEL CARRITO (Con Desenfoque de Fondo backdrop-blur) */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 md:p-10">
            
            {/* Backdrop con desenfoque de fondo premium */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-[#2F1F17]/70 backdrop-blur-md transition-opacity"
            />

              {/* Contenedor Principal de la Modal (Elegante, central/bottom-sheet adaptable, max-height con scroll interno fluido) */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                className="relative w-full max-w-xl lg:max-w-4xl bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#F4EBE0] z-50 text-[#2F1F17] flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden"
              >
              
              {/* Cabecera Fija de la Modal */}
              <div className="px-6 py-5 border-b border-[#F4EBE0] flex items-center justify-between shrink-0 bg-[#FDFBF7] z-10">
                <div className="flex items-center gap-2 text-[#4E5B6A]">
                  <ShoppingBag className="w-5 h-5 text-rose-400" />
                  <h3 className="font-serif text-lg font-black tracking-tight">Tu Bolsa de Amor</h3>
                </div>
                
                {/* Botón de Cierre */}
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full bg-[#FAF6EE] hover:bg-rose-500 hover:text-white border border-[#EBE3D5] transition-all cursor-pointer"
                  title="Cerrar bolsa"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Área de Contenido Escuchable Todo Junto (Solución Definitiva al Scroll y Teclados Virtuales) */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-6 scrollbar-thin scroll-smooth text-left bg-[#FDFBF7]/50">
                
                {cart.length === 0 ? (
                  /* State Vacío de Alta Categoría con ilustración original */
                  <div className="text-center py-12 space-y-5 flex flex-col items-center justify-center w-full">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#FFF5F5] rounded-full scale-100 animate-pulse duration-1000" />
                      <div className="absolute inset-2 bg-rose-50 rounded-full scale-95 border border-rose-100/40" />
                      
                      <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="flex gap-1.5 mb-1 animate-bounce">
                          <span className="text-xs text-rose-300 transform -rotate-12 animate-pulse duration-500">~</span>
                          <span className="text-sm text-amber-300 transform rotate-6 animate-pulse">~</span>
                          <span className="text-xs text-rose-300 transform -rotate-6 animate-pulse duration-700">~</span>
                        </div>
                        <div className="w-16 h-12 bg-gradient-to-br from-rose-400 to-[#2F1F17] rounded-b-2xl rounded-t-xs relative shadow-md">
                          <div className="absolute top-2 -right-3 w-5 h-6 border-4 border-[#2F1F17] rounded-full" />
                          <div className="absolute inset-0 flex items-center justify-center text-white text-[12px]">
                            💖
                          </div>
                        </div>
                        <div className="w-20 h-2 bg-[#FAF8F5] border border-stone-200 rounded-full mt-1.5 shadow-3xs" />
                      </div>
                      
                      <motion.span 
                        animate={{ y: [-3, 3, -3], rotate: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute top-3 left-4 text-xs select-none"
                      >
                        🌸
                      </motion.span>
                      <motion.span 
                        animate={{ y: [4, -4, 4], rotate: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                        className="absolute bottom-5 right-4 text-xs select-none"
                      >
                        ✨
                      </motion.span>
                      <motion.span 
                        animate={{ scale: [0.9, 1.1, 0.9] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="absolute top-2 right-6 text-xs select-none"
                      >
                        🥐
                      </motion.span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[#4E5B6A] font-black text-base font-serif">Tu bolsa está vacía</h4>
                      <p className="text-xs text-stone-400 px-6 font-light leading-relaxed max-w-xs mx-auto">
                        Inspiraciones inolvidables te esperan. Ve al menú y agrega asados, cafés o frappés del día.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-5 py-2.5 bg-[#2F1F17] hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm mt-2"
                    >
                      Explorar el Menú ahora
                    </button>
                  </div>
                ) : (
                  /* Distribución en dos columnas al abrir el carrito en PC */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    
                    {/* COLUMNA IZQUIERDA: Detalle de Platillos con notas individuales */}
                    <div className="space-y-4">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#AF9C89] uppercase font-mono pb-1 border-b border-rose-100">
                        Detalle de Platillos
                      </span>
                      
                      <div className="space-y-3">
                        {cart.map((cartItem) => (
                          <div 
                            key={cartItem.item.id}
                            className="bg-white p-3.5 rounded-2xl border border-[#F4EBE0]/80 shadow-3xs hover:border-rose-100 transition-all space-y-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif font-black text-sm text-[#2F1F17] leading-tight text-left">
                                  {cartItem.item.name}
                                </h4>
                                <span className="text-[10px] text-[#AF9C89] font-mono block mt-0.5 text-left">
                                  C$ {cartItem.item.price} c/u • Subtotal: C$ {cartItem.item.price * cartItem.quantity}
                                </span>
                              </div>
                              
                              {/* Control de cantidad en Modal */}
                              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-full px-2 py-0.5 shrink-0">
                                <button 
                                  onClick={() => {
                                    if (cartItem.quantity === 1) {
                                      setItemToDelete(cartItem.item);
                                    } else {
                                      updateQuantity(cartItem.item.id, -1);
                                    }
                                  }}
                                  className="p-0.5 hover:bg-stone-200 rounded-full text-stone-600 transition-colors cursor-pointer"
                                  aria-label="Disminuir"
                                >
                                  <Minus className="w-3 h-3 text-stone-600" />
                                </button>
                                <span className="font-mono text-xs font-bold text-[#2F1F17] w-4 text-center select-none">
                                  {cartItem.quantity}
                                </span>
                                <button 
                                  onClick={() => updateQuantity(cartItem.item.id, 1)}
                                  className="p-0.5 hover:bg-stone-200 rounded-full text-stone-600 transition-colors cursor-pointer"
                                  aria-label="Aumentar"
                                >
                                  <Plus className="w-3 h-3 text-stone-600" />
                                </button>
                              </div>

                              {/* Quitar elemento */}
                              <button 
                                onClick={() => setItemToDelete(cartItem.item)}
                                className="p-1.5 hover:text-red-500 text-stone-300 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                                title="Eliminar artículo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Campo de notas individuales para preparaciones del platillo */}
                            <div className="pt-2 border-t border-dashed border-stone-100 flex items-center gap-1.5">
                              <span className="text-[10px] text-[#AF9C89] shrink-0 font-medium">📋 Notas:</span>
                              <input 
                                type="text"
                                placeholder="Ej: Sin cebolla, frappé bien frío..."
                                value={cartItem.notes || ''}
                                onChange={(e) => updateNotes(cartItem.item.id, e.target.value)}
                                className="flex-1 bg-[#FAF8F5] hover:bg-[#FAF6EE] focus:bg-white text-[11px] text-[#2F1F17] rounded-lg px-2.5 py-1 border border-[#EBE3D5] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400 transition-colors"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Maridaje Recomendado Section */}
                      {pairingsToDisplay.length > 0 && (
                        <div className="bg-[#FAF7F2] p-4 rounded-3xl border border-amber-200/40 mt-4 text-left relative overflow-hidden min-h-[150px] flex flex-col justify-center">
                          {isAiLoading ? (
                            <div className="w-full flex flex-col items-center justify-center py-6 px-4 animate-fade-in text-center select-none">
                              <style dangerouslySetInnerHTML={{ __html: `
                                @keyframes float-heart {
                                  0% { transform: translateY(15px) translateX(0) scale(0.6); opacity: 0; }
                                  30% { opacity: 0.9; }
                                  80% { opacity: 0.5; }
                                  100% { transform: translateY(-45px) translateX(var(--x-offset, 12px)) scale(1.1); opacity: 0; }
                                }
                                @keyframes steam {
                                  0%, 100% { transform: translateY(0) scaleX(1); opacity: 0; }
                                  50% { opacity: 0.6; transform: translateY(-8px) scaleX(1.35); }
                                }
                                @keyframes flower-spin {
                                  0% { transform: rotate(0deg); }
                                  100% { transform: rotate(360deg); }
                                }
                                @keyframes float-flower {
                                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                                  50% { transform: translateY(-4px) rotate(8deg); }
                                }
                                .animate-float-heart-1 { animation: float-heart 2.4s infinite ease-out; --x-offset: -16px; }
                                .animate-float-heart-2 { animation: float-heart 2s infinite ease-out; animation-delay: 0.8s; --x-offset: 18px; }
                                .animate-float-heart-3 { animation: float-heart 2.8s infinite ease-out; animation-delay: 1.4s; --x-offset: -6px; }
                                .animate-steam-1 { animation: steam 2.2s infinite ease-in-out; }
                                .animate-steam-2 { animation: steam 2.2s infinite ease-in-out; animation-delay: 1.1s; }
                                .animate-flower-spin { animation: flower-spin 18s linear infinite; }
                                .animate-float-flower { animation: float-flower 3s ease-in-out infinite; }
                              `}} />

                              <div className="relative flex items-center justify-center mb-4">
                                {/* Decorative rotating flower ring */}
                                <div className="absolute w-20 h-20 border border-rose-100/60 rounded-full animate-flower-spin flex items-center justify-center">
                                  <span className="absolute -top-1.5 text-[11px] select-none">🌸</span>
                                  <span className="absolute -bottom-1.5 text-[11px] select-none">🌸</span>
                                  <span className="absolute -left-1.5 text-[11px] select-none">🌸</span>
                                  <span className="absolute -right-1.5 text-[11px] select-none">🌸</span>
                                </div>

                                {/* Main floating cup frame */}
                                <div className="relative w-14 h-14 rounded-full bg-white border border-rose-100 flex items-center justify-center shadow-xs animate-float-flower">
                                  {/* Rising sweet hearts */}
                                  <Heart className="absolute w-3.5 h-3.5 text-rose-500 fill-rose-300 animate-float-heart-1 -top-1" />
                                  <Heart className="absolute w-2.5 h-2.5 text-rose-400 fill-rose-200 animate-float-heart-2 -top-1" />
                                  <Heart className="absolute w-2 h-2 text-[#E67E65] fill-[#E67E65]/70 animate-float-heart-3 -top-1" />

                                  {/* Steam waves */}
                                  <div className="absolute -top-2 left-[38%] w-0.5 h-3 bg-rose-300/40 rounded-full animate-steam-1" />
                                  <div className="absolute -top-3 left-[58%] w-0.5 h-4 bg-rose-200/40 rounded-full animate-steam-2" />

                                  {/* Hot Coffee Cup */}
                                  <Coffee className="w-6 h-6 text-[#5C3D2E] relative z-10" />
                                </div>
                              </div>

                              <div className="space-y-1 z-10 max-w-[210px]">
                                <h4 className="text-xs font-serif font-black text-[#2F1F17] tracking-tight">¿Te gustaría acompañarlo con...?</h4>
                                <p className="text-[9.5px] text-[#A28A7A] font-medium tracking-wide">
                                  Preparando un maridaje de nuestra casa con mucho amor... ✨
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2.5 animate-fade-in w-full">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                                <span className="text-xs font-serif font-black text-[#2F1F17] leading-none">
                                  ¿Te gustaría acompañarlo con?
                                </span>
                                {isAiSourced && (
                                  <span className="text-[8px] bg-rose-50 text-[#9C3241] border border-rose-100/60 px-1.5 py-0.5 rounded-full font-sans font-black uppercase tracking-wider block leading-none">
                                    Recomendador IA ✨
                                  </span>
                                )}
                              </div>

                              <p className="text-[10px] text-stone-500 leading-tight">
                                {pairingReasonToDisplay}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {pairingsToDisplay.map((item) => (
                                  <motion.button 
                                    key={item.id}
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addToCart(item)}
                                    className="w-full bg-white p-2 border border-[#F4EBE0]/75 rounded-2xl flex items-center gap-2 hover:border-rose-300 hover:bg-rose-50/10 transition-all shadow-3xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-400 text-left group animate-none"
                                  >
                                    <img 
                                      src={item.image} 
                                      alt={item.name} 
                                      referrerPolicy="no-referrer"
                                      className="w-10 h-10 object-cover rounded-xl shrink-0 border border-stone-100"
                                    />
                                    <div className="flex-1 min-w-0 text-left">
                                      <h5 className="font-serif font-bold text-[11px] text-[#2F1F17] leading-tight truncate">
                                        {item.name}
                                      </h5>
                                      <span className="text-[9px] text-[#AF9C89] font-mono leading-none block mt-0.5">
                                        C$ {item.price}
                                      </span>
                                    </div>
                                    <div 
                                      className="p-1.5 bg-[#2F1F17] group-hover:bg-rose-500 text-white rounded-xl transition-all flex items-center justify-center shrink-0"
                                      title="Agregar a mi pedido"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* COLUMNA DERECHA: Información de Entrega y Resumen */}
                    <div className="space-y-4">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#AF9C89] uppercase font-mono pb-1 border-b border-rose-100">
                        Información de Entrega
                      </span>

                      <div className="space-y-3.5 text-left">
                        {/* Campo Nombre */}
                        <div className="relative">
                          <label className="block text-[10px] font-extrabold text-[#4E5B6A] uppercase tracking-wider mb-1 font-mono">
                            👤 Tu Nombre Completo
                          </label>
                          <input 
                            type="text" 
                            placeholder="Escribe tu nombre para el pedido"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-2 text-xs text-[#2F1F17] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition-colors shadow-3xs"
                          />
                        </div>

                        {/* Campo Tipo de Entrega - Selección de Retiro interactiva */}
                        <div>
                          <label className="block text-[10px] font-extrabold text-[#4E5B6A] uppercase tracking-wider mb-1.5 font-mono">
                            🛵 ¿Cómo deseas recibirlo?
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 bg-white p-1 border border-[#EBE3D5] rounded-xl">
                            <button 
                              type="button"
                              onClick={() => {
                                setDeliveryType('delivery');
                                const savedAddress = localStorage.getItem('amor_y_cafe_default_address') || '';
                                if (!addressOrTime || addressOrTime.match(/^(en\s|a\slas\s|\d{1,2}:|aprox)/i)) {
                                  setAddressOrTime(savedAddress);
                                }
                              }}
                              className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${deliveryType === 'delivery' ? 'bg-[#2F1F17] text-white shadow-xs' : 'text-stone-500 hover:bg-stone-50'}`}
                            >
                              🛵 A Domicilio / Envío
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                const savedAddress = localStorage.getItem('amor_y_cafe_default_address') || '';
                                if (addressOrTime === savedAddress) {
                                  setAddressOrTime('');
                                }
                                setDeliveryType('llevar');
                              }}
                              className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${deliveryType === 'llevar' ? 'bg-[#2F1F17] text-white shadow-xs' : 'text-stone-500 hover:bg-stone-50'}`}
                            >
                              🛍️ Para Llevar / Local
                            </button>
                          </div>
                        </div>

                        {/* Campo Dinámico Dirección o Hora */}
                        <div className="relative">
                          <label className="block text-[10px] font-extrabold text-[#4E5B6A] uppercase tracking-wider mb-1 font-mono">
                            {deliveryType === 'delivery' ? '🏠 Dirección detallada de envío en Waslala' : '🕒 Hora de Retiro en Local estimada'}
                          </label>
                          <input 
                            type="text" 
                            placeholder={deliveryType === 'delivery' ? "Ej: Frente al Parque Central, portón negro..." : "Ej: En 15 min / a las 12:30 PM"}
                            value={addressOrTime}
                            onChange={(e) => setAddressOrTime(e.target.value)}
                            className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-2 text-xs text-[#2F1F17] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition-colors shadow-3xs"
                          />
                        </div>

                        {/* Campo Notas Especiales */}
                        <div className="relative">
                          <label className="block text-[10px] font-extrabold text-[#4E5B6A] uppercase tracking-wider mb-1 font-mono">
                            📝 Indicaciones especiales o notas (Opcional)
                          </label>
                          <input 
                            type="text" 
                            placeholder="Ej: Extra salsa, frappé sin crema batida..."
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-2 text-xs text-[#2F1F17] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition-colors shadow-3xs"
                          />
                        </div>
                      </div>

                      {/* Resumen Final de Costos (Estilo Premium con fondo cálido) */}
                      <div className="bg-[#FAF6EE] rounded-2xl border border-[#F4EBE0] p-4 space-y-3">
                        <div className="space-y-1 text-xs font-mono text-[#5A493B]">
                          <div className="flex justify-between">
                            <span>Subtotal de consumo:</span>
                            <span className="font-bold">C$ {totalCartPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🛵 Costo de envío:</span>
                            <span>{deliveryType === 'delivery' ? `C$ ${deliveryFee}` : 'Gratis'}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-dashed border-stone-300 flex items-center justify-between font-bold text-[#2f1f17]">
                          <span className="text-xs sm:text-sm font-serif">Total neto del Pedido:</span>
                          <span className="text-rose-500 font-mono text-lg sm:text-xl">C$ {grandTotalPrice}</span>
                        </div>
                      </div>

                      {/* Bloque del Botón de Confirmación Imponente */}
                      <div className="pt-2 flex flex-col items-center">
                        <button 
                          onClick={handleCheckoutWhatsApp}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-emerald-700/10 hover:shadow-lg transition-all duration-300 cursor-pointer text-[11px] uppercase tracking-wider group animate-none"
                        >
                          <svg className="w-4 h-4 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.004 2C6.48 2 2 6.48 2 12c0 1.76.46 3.42 1.27 4.88l-1.21 4.43c-.08.3.01.62.24.84.17.17.4.25.64.25.07 0 .13 0 .2-.02l4.52-1.23c1.4.74 2.97 1.15 4.58 1.15 5.52 0 10-4.48 10-10S17.52 2 12.004 2zM12 20.2c-1.51 0-2.98-.38-4.3-1.09l-.3-.16-2.58.7.72-2.6-.18-.3c-.78-1.32-1.2-2.83-1.2-4.39 0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2zm4.4-6.31c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06a6.56 6.56 0 0 1-1.92-1.18c-.71-.63-1.18-1.4-1.32-1.64-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42l-.74-1.78c-.2-.48-.4-.41-.55-.42-.14-.01-.3-.01-.46-.01a.88.88 0 0 0-.64.3c-.22.24-.84.82-.84 2s.87 2.33.99 2.49c.12.16 1.7 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.42-.58 1.62-1.13.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28z"/>
                          </svg>
                          <span className="font-sans tracking-wider whitespace-nowrap">Confirmar pedido</span>
                        </button>
                        <p className="text-[9px] text-stone-400 font-light text-center leading-normal max-w-xs mt-2">
                          Serás redirigido de inmediato a WhatsApp para validar y agilizar de tu mesa en Amor y Café.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MENÚ LATERAL DESPLEGABLE DE INFORMACIÓN Y CONTACTO (Esquina Superior Derecha) */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-[120] overflow-hidden">
            
            {/* Backdrop obscuro con desenfoque de fondo */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContactOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-[#FDFBF7] shadow-2xl flex flex-col h-screen border-l border-[#F4EBE0]"
              >
                
                {/* Cabecera del Panel */}
                <div className="px-5 py-5 bg-[#2F1F17] text-[#FDFBF7] flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2 text-left">
                    <Info className="w-5 h-5 text-rose-300" />
                    <div>
                      <h2 className="font-serif text-lg font-bold">Información & Contacto</h2>
                      <span className="text-[10px] uppercase font-mono tracking-wider block text-rose-200">Waslala • Restaurante & Café</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsContactOpen(false)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contenido del Panel */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-left">
                  
                  {/* Tarjeta Informativa de Bienvenida */}
                  <div className="bg-rose-50/40 rounded-2xl border border-rose-100 p-4 space-y-1.5 relative overflow-hidden">
                    <span className="absolute top-2 right-2 text-2xl opacity-40">🌸</span>
                    <h3 className="font-bold text-xs text-[#4E5B6A] uppercase tracking-wide">Atmósfera de Amor y Café</h3>
                    <p className="text-xs text-[#5A493B] font-light leading-relaxed">
                      Seleccionamos los mejores granos de altura cultivados en la región central del país, tostados a la perfección para conseguir un aroma único que te conecte con tus sentidos.
                    </p>
                  </div>

                  {/* Horario de Atención */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] tracking-widest uppercase font-extrabold text-[#AF9C89] font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-400" /> Horarios de Puertas Abiertas
                    </h3>
                    <div className="bg-white p-4 rounded-2xl border border-[#F4EBE0]/80 space-y-2">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-100">
                        <span className="font-semibold text-[#2F1F17]">Lunes a Domingo:</span>
                        <span className="font-mono text-stone-600">7:30 AM - 9:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-800 font-mono uppercase bg-emerald-50 px-2 py-0.5 rounded">¡Atendiendo Pedidos en línea!</span>
                      </div>
                    </div>
                  </div>

                  {/* Datos de Contacto Directo */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] tracking-widest uppercase font-extrabold text-[#AF9C89] font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-rose-400" /> Líneas Directas
                    </h3>
                    <div className="space-y-2">
                      
                      {/* WhatsApp Box */}
                      <a 
                        href="https://wa.me/50577887330" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-3 bg-[#E6F9F2] hover:bg-emerald-100/80 p-3.5 rounded-2xl border border-emerald-200 transition-all block group"
                      >
                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.25 8.477 3.517 2.266 2.268 3.511 5.281 3.51 8.487-.005 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.714-1.46L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.8 1.45 5.518 0 10.011-4.493 10.016-10.01.004-2.674-1.037-5.188-2.932-7.085C16.634 1.61 14.127.57 11.45.57 5.932.57 1.44 5.062 1.435 10.58c-.001 1.83.483 3.61 1.398 5.17l-.21 1.307c-.43.6-.9 1.55-.9 1.55 1.15.35 1.6.45 1.6.45s.75-.4 1.76-1.07l.564-.323zM16.92 14.2c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.69.88-.85 1.07-.16.18-.32.21-.59.08s-1.13-.42-2.15-1.33c-.79-.7-1.33-1.58-1.48-1.85-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.13-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.61-1.47-.83-2-.22-.53-.44-.46-.61-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.98 2.67 1.12 2.85c.14.18 1.93 2.95 4.67 4.13.65.28 1.16.45 1.56.57.65.2 1.25.17 1.72.1.53-.08 1.6-.66 1.83-1.27.23-.61.23-1.12.16-1.27-.07-.15-.25-.24-.52-.37z"/>
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <span className="block font-bold text-xs text-emerald-900 group-hover:text-emerald-950">Charla Directa por WhatsApp</span>
                          <span className="font-mono text-xs text-emerald-700 font-black">+505 7788 7330</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                      </a>

                      {/* Phone Box */}
                      <a 
                        href="tel:+50577887330" 
                        className="flex items-center gap-3 bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-stone-200 transition-all block group"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#2F1F17] text-[#FAF8F5] flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="block font-bold text-xs text-stone-700">Llamada de Voz</span>
                          <span className="font-mono text-xs text-stone-500">+505 7788 7330</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                      </a>

                    </div>
                  </div>

                  {/* Redes Sociales */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] tracking-widest uppercase font-extrabold text-[#AF9C89] font-mono flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-rose-400" /> Síguenos en Redes
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      <a 
                        href="https://instagram.com" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex flex-col items-center justify-center gap-1 bg-white hover:bg-rose-50 hover:border-rose-200 border border-[#EBE3D5] p-2.5 rounded-2xl transition-all text-[10px] font-bold text-[#4E5B6A] group"
                      >
                        <Instagram className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span>Instagram</span>
                      </a>
                      <a 
                        href="https://facebook.com" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex flex-col items-center justify-center gap-1 bg-white hover:bg-rose-50 hover:border-rose-200 border border-[#EBE3D5] p-2.5 rounded-2xl transition-all text-[10px] font-bold text-[#4E5B6A] group"
                      >
                        <Facebook className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span>Facebook</span>
                      </a>
                      <a 
                        href="https://www.tiktok.com/@amor.caf3?_r=1&_t=ZS-96yAWrpwE8P" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex flex-col items-center justify-center gap-1 bg-white hover:bg-stone-50 hover:border-stone-200 border border-[#EBE3D5] p-2.5 rounded-2xl transition-all text-[10px] font-bold text-[#4E5B6A] group"
                      >
                        <Music className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
                        <span>TikTok</span>
                      </a>
                    </div>
                  </div>

                  {/* Dirección y Mapa */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] tracking-widest uppercase font-extrabold text-[#AF9C89] font-mono flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" /> Ubicación en Waslala
                    </h3>
                    <div className="bg-white p-4 rounded-2xl border border-[#F4EBE0]/80 space-y-3">
                      <p className="text-xs text-[#5A493B] font-light leading-relaxed">
                        <strong>Dirección:</strong> Cafetería y restaurante, estamos ubicados en waslala, barrio el papayo de la gasolinera estación de servicio 100 mts al este.
                      </p>
                      
                      {/* Enlace gráfico / mini mapa simulado */}
                      <div className="relative group overflow-hidden rounded-xl border border-rose-100 bg-rose-50/20 p-4 text-center">
                        <Map className="w-7 h-7 text-rose-400 mx-auto mb-1 animate-pulse" />
                        <span className="block text-[10px] font-mono font-bold text-rose-700 uppercase">Ver mapa detallado</span>
                        <span className="block text-[9px] text-stone-400 font-light mt-0.5">Abre en Google Maps dirección exacta</span>
                        
                        {/* El enlace definitivo de Google Maps para Waslala */}
                        <a 
                          href="https://maps.app.goo.gl/LLGP75btdbTgAWtZ9?g_st=ac" 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 z-10 block"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Facilidades y Amenidades del local */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] tracking-widest uppercase font-extrabold text-[#AF9C89] font-mono flex items-center gap-1.5">
                      💡 Facilidades del Local
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-stone-600 font-semibold text-[10px] uppercase">
                      <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-[#F4EBE0]/60">
                        <Wifi className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Wifi de Cortesía</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-[#F4EBE0]/60">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Pet Friendly</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-[#F4EBE0]/60">
                        <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Música Acogedora</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-[#F4EBE0]/60">
                        <Gift className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Eventos Cumpleaños</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Pie del Panel Lateral */}
                <div className="p-4 border-t border-[#F4EBE0]/80 bg-[#FAF8F5] flex flex-col items-center justify-center gap-1.5">
                  <div className="text-[10px] text-stone-400 italic">
                    ❝ Sabor que enamora, café que inspira 🌸 ❞
                  </div>
                  <button 
                    onClick={() => {
                      setIsContactOpen(false);
                      setShowDeveloperModal(true);
                    }}
                    className="w-full mt-1 px-3 py-2 bg-white hover:bg-[#FAF6EE] border border-[#FAEDE0] rounded-xl flex items-center justify-center gap-1.5 text-[10px] text-[#2F1F17] font-serif italic shadow-3xs cursor-pointer transition-all hover:border-[#AF9C89]/40 group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-12 transition-transform" />
                    <span>Desarrollador</span>
                  </button>
                </div>

              </motion.div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* PIE DE PÁGINA (COZY FOOTER) */}
      <footer className="bg-[#2F1F17] text-[#FAF8F5]/80 pt-16 pb-36 sm:pb-32 px-6 border-t border-[#3F2B1E] text-xs font-light">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          
          <div className="md:col-span-2 space-y-4">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF8F5] block">
              Amor & Café - Waslala
            </span>
            <p className="leading-relaxed text-[#D6C4B0] max-w-sm">
              Disfruta la inigualable calidez de Amor y Café. Un espacio creado en la hermosa Región Central de Nicaragua con la dedicada selección de deliciosos frappés, asados de primera y postres con toques florales que deleitan tus sentidos.
            </p>
            <div className="pt-2 flex justify-center md:justify-start gap-4 text-xs font-mono text-[#AF9C89]">
              <span>Waslala, Nicaragua</span>
              <span>•</span>
              <span>Est. 2024</span>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-serif text-sm font-bold tracking-wider text-rose-300 uppercase">Menú de Excelencia</h5>
            <ul className="space-y-2 text-[#D6C4B0]">
              <li><button onClick={() => handleScrollToSegment('antojitos')} className="hover:text-white transition-colors cursor-pointer">Antojitos de la Casa</button></li>
              <li><button onClick={() => handleScrollToSegment('cortes_premium')} className="hover:text-white transition-colors cursor-pointer">Cortes Premium 🔥</button></li>
              <li><button onClick={() => handleScrollToSegment('bebidas_calientes')} className="hover:text-white transition-colors cursor-pointer">Capuccinos & Americanos</button></li>
              <li><button onClick={() => handleScrollToSegment('bebidas_frias')} className="hover:text-white transition-colors cursor-pointer">Frappés Fríos Especiales</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-serif text-sm font-bold tracking-wider text-rose-300 uppercase">Horarios y Atención</h5>
            <div className="space-y-1.5 text-[#D6C4B0] font-mono text-[11px]">
              <span className="block font-bold text-[#faf8f5]">Lunes a Domingos:</span>
              <span className="block">7:30 AM - 9:00 PM</span>
              <span className="block italic text-rose-200 mt-2">¿Quieres consultar o reservar mesa?</span>
              <span className="block font-bold text-white text-xs mt-1">+505 7788 7330</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#AF9C89] gap-4 pb-2">
          <div className="text-center sm:text-left space-y-1">
            <p>© 2026 Amor y Café Waslala. Todos los derechos reservados.</p>
            <p className="text-[#AF9C89]/80 font-mono text-[10px]">
              Creado con esmero para Waslala, Región Central de Nicaragua.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setShowDeveloperModal(true)}
              className="px-4 py-2 bg-[#251811] hover:bg-[#1C100A] border border-[#AF9C89]/25 rounded-xl text-rose-300 hover:text-white transition-all text-xs font-serif italic cursor-pointer flex items-center gap-2 shadow-2xs group"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-300 animate-pulse group-hover:rotate-12 transition-transform" />
              <span>Desarrollador</span>
            </button>
            <span className="text-stone-400 font-serif italic text-xs hidden md:inline">Sabor que enamora, café que inspira 🌸</span>
          </div>
        </div>
      </footer>

      {/* MODAL DE INFORMACIÓN DEL DESARROLLADOR CARLOS RIVERA */}
      <AnimatePresence>
        {showDeveloperModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeveloperModal(false)}
              className="absolute inset-0 bg-[#1D130E]/80 backdrop-blur-xs"
            />
            
            {/* Modal de Alerta */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-[#FDFBF7] rounded-3xl border border-[#FAEDE0] p-6 max-w-sm w-full shadow-2xl relative text-center space-y-5 z-10"
            >
              {/* Botón Cerrar */}
              <button 
                onClick={() => setShowDeveloperModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-[#2F1F17] transition-colors p-1.5 rounded-full hover:bg-[#FAF6EE] cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-[#2F1F17]/5 rounded-full flex items-center justify-center mx-auto text-[#2F1F17]">
                <Coffee className="w-7 h-7 text-[#2F1F17]" />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] uppercase font-black tracking-widest text-[#AF9C89] font-mono block">
                  ⚙️ Desarrollador de Software
                </span>
                <h3 className="font-serif text-2xl font-black text-[#2F1F17] tracking-tight">
                  Carlos Rivera
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 font-light leading-relaxed max-w-xs mx-auto">
                  Creador de interfaces interactivas para impulsar negocios locales. Especializado en sistemas modernos, intuitivos y con alta retención de clientes.
                </p>
              </div>

              {/* Botones de Contacto */}
              <div className="space-y-2 pt-1 font-sans">
                {/* Instagram Button */}
                <a 
                  href="https://www.instagram.com/carl0s_riv?igsh=a2EyN3FuY3JtemJ0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-[#FAF6EE] border border-[#FAEDE0] rounded-xl transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-xs">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-[8px] text-stone-400 font-bold uppercase tracking-wider font-mono leading-none mb-0.5">Instagram</span>
                      <span className="text-xs font-semibold text-[#2F1F17]">@carl0s_riv</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#2F1F17] group-hover:translate-x-1 transition-all" />
                </a>

                {/* Telegram Button */}
                <a 
                  href="https://t.me/carl0s_riv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-[#FAF6EE] border border-[#FAEDE0] rounded-xl transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#0088cc] rounded-lg flex items-center justify-center text-white shadow-xs">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.87 7.97-3.43 3.79-1.59 4.58-1.87 5.09-1.88.11 0 .36.03.52.16.14.11.18.27.19.38 0 .08.01.24 0 .3c-.02.21-.11.63-.12.75z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-[8px] text-stone-400 font-bold uppercase tracking-wider font-mono leading-none mb-0.5">Telegram</span>
                      <span className="text-xs font-semibold text-[#2F1F17]">@carl0s_riv</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#2F1F17] group-hover:translate-x-1 transition-all" />
                </a>

                {/* WhatsApp Button */}
                <a 
                  href="https://wa.me/50558096438" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-[#FAF6EE] border border-[#FAEDE0] rounded-xl transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#25D366] rounded-lg flex items-center justify-center text-white shadow-xs">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.395 0 .01 5.39-1.e-3 12.049c0 2.13.554 4.21 1.61 6.009L0 24l6.15-1.613a11.77 11.77 0 005.891 1.57h.005c6.654 0 12.04-5.39 12.042-12.049.002-3.23-1.257-6.269-3.536-8.548"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="block text-[8px] text-stone-400 font-bold uppercase tracking-wider font-mono leading-none mb-0.5">WhatsApp / Celular</span>
                      <span className="text-xs font-semibold text-[#2F1F17]">+505 5809 6438</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#2F1F17] group-hover:translate-x-1 transition-all" />
                </a>
              </div>

              {/* Pie Informativo */}
              <div className="bg-[#FAF6EE] p-3 rounded-xl">
                <p className="text-[10px] text-[#5A493B] font-light leading-relaxed">
                  🚀 ¿Quieres impulsar tu negocio con una página web moderna? Hablemos y cotiza tu diseño hoy mismo.
                </p>
              </div>

              <div className="text-[9px] font-mono text-[#AF9C89] italic">
                Desarrollado con alma y pasión ☕
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE PLATO */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelDelete}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            />
            
            {/* Modal de Alerta */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 210 }}
              className="bg-[#FDFBF7] rounded-3xl border border-[#F4EBE0] p-6 max-w-sm w-full shadow-2xl relative text-center space-y-4"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 className="w-5 h-5 text-rose-500" />
              </div>
              
              <div className="space-y-1">
                <h4 className="font-serif font-black text-base text-[#2F1F17]">
                  ¿Eliminar del pedido?
                </h4>
                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  ¿Estás seguro de que deseas quitar <strong className="font-semibold text-stone-700">{itemToDelete.name}</strong> de tu bolsa de compras?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="py-2.5 bg-[#FAF6EE] hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-200/50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-rose-200"
                >
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
