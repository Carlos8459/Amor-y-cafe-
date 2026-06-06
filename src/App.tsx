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

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'llevar'>('delivery');
  const [addressOrTime, setAddressOrTime] = useState<string>('');
  
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

  // Filtered menu items for search filter
  const itemsFilteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return MENU_ITEMS;
    return MENU_ITEMS.filter((item) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Grouped items strictly under specified sections
  const menuSections = useMemo(() => {
    return {
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
      ]
    };
  }, [itemsFilteredBySearch]);

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
      const offset = 100; // room for sticky navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
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
      return [...prev, { item, quantity: 1 }];
    });

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
                    src="/src/assets/images/logo_amor_y_cafe_1780705355382.png" 
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
      <nav className="sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#F4EBE0]/75 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          
          {/* Logotipo Centralizado de la marca */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#F4EBE0] bg-white flex items-center justify-center shadow-md shrink-0 transition-transform hover:scale-105 duration-300">
              <img 
                src="/src/assets/images/logo_amor_y_cafe_1780705355382.png" 
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

      {/* SECCIÓN: INTERACTIVE DAILY OFFERS CAROUSEL (Moverá sola de forma fluida y libre de botones ruidosos) */}
      <section className="bg-[#FAF6EE] border-y border-[#F3ECE0] py-10 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* Header de Ofertas Especiales */}
          <div className="text-center mb-6">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#AF9C89] flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Inspiraciones del Chef
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-black text-[#4E5B6A] mt-0.5">
              Especiales del día
            </h3>
          </div>

          {/* Contenedor del Slider con Transición Suave, más pequeño, auto-jugable al pasar mouse */}
          <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative bg-white rounded-2xl border border-[#F1E9DC] p-5 md:p-6 shadow-xs overflow-hidden max-w-2xl mx-auto transition-all duration-300 hover:scale-[1.01]"
          >
            
            <AnimatePresence mode="wait">
              <motion.div
                key={dailyRecommendations[activeSlide].id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(event, info) => {
                  if (info.offset.x < -80) {
                    nextSlide();
                  } else if (info.offset.x > 80) {
                    prevSlide();
                  }
                }}
                whileTap={{ cursor: 'grabbing' }}
                className="flex flex-col gap-4 cursor-grab select-none active:cursor-grabbing w-full touch-pan-y"
              >
                {/* Detalles de la Oferta - Full Width */}
                <div className="space-y-3 w-full text-left">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[8px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      🔥 Especial del día
                    </span>
                    <span className="text-[8px] font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                      {SUBCATEGORIES_LABELS[dailyRecommendations[activeSlide].subcategory] || 'Recomendado'}
                    </span>
                  </div>

                  <h4 className="font-serif text-base sm:text-lg font-black text-[#2F1F17] leading-tight">
                    {dailyRecommendations[activeSlide].name}
                  </h4>
                  
                  <p className="text-[11px] sm:text-xs text-[#5A493B] font-light leading-relaxed">
                    {dailyRecommendations[activeSlide].description}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-4">
                    {/* Precios fijos únicamente */}
                    <div className="space-y-0.5">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-[#AF9C89] font-bold">Precio</span>
                      <span className="text-base sm:text-lg font-black text-rose-500 font-mono">
                        C$ {dailyRecommendations[activeSlide].price}
                      </span>
                    </div>

                    <div className="flex-1 min-w-[124px] md:max-w-[180px]">
                      <button
                        onClick={() => addToCart(dailyRecommendations[activeSlide])}
                        className="w-full px-4 py-2 bg-[#2F1F17] hover:bg-rose-500 text-white font-bold rounded-xl text-[10px] tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 group shadow-xs"
                      >
                        <span>[Añadir a la orden]</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Balas / Dots de Navegación Directa Compactas */}
            <div className="mt-4 flex justify-center gap-1.5 pt-1.5 border-t border-[#F1E9DC]/60">
              {dailyRecommendations.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  onClick={() => setActiveSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${activeSlide === i ? 'bg-[#2F1F17] w-5' : 'bg-stone-200 hover:bg-stone-400'}`}
                  aria-label={`Ir al slide ${i+1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* STRIP DE CONTROLADORAS STICKY DE CATEGORÍA */}
      <div className="sticky top-[72px] bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#F4EBE0]/60 py-3 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Categorías deslizables */}
          <div className="flex items-center gap-2 overflow-x-auto w-full no-scrollbar pb-1 md:pb-0">
            
            <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-[#F4EBE0]/70 text-[10px] font-black uppercase text-[#AF9C89] tracking-wider">
              <span className="text-xs">🍱</span> Comidas:
            </div>
            {menuSections.comidas.map((sec) => (
              <button 
                key={sec.id}
                onClick={() => handleScrollToSegment(sec.id)}
                className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-rose-50 border border-[#EBE3D5] hover:border-rose-200 text-xs font-semibold rounded-full text-[#5A493B] hover:text-rose-600 transition-all cursor-pointer whitespace-nowrap"
              >
                {sec.label}
              </button>
            ))}

            <div className="flex items-center gap-1.5 shrink-0 pl-3 pr-3 border-l border-r border-[#F4EBE0]/70 text-[10px] font-black uppercase text-[#AF9C89] tracking-wider ml-2">
              <span className="text-xs">☕</span> Bebidas:
            </div>
            {menuSections.bebidas.map((sec) => (
              <button 
                key={sec.id}
                onClick={() => handleScrollToSegment(sec.id)}
                className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-rose-50 border border-[#EBE3D5] hover:border-rose-200 text-xs font-semibold rounded-full text-[#5A493B] hover:text-rose-600 transition-all cursor-pointer whitespace-nowrap"
              >
                {sec.label}
              </button>
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
        
        {/* CATEGORÍA: COMIDAS */}
        <div className="space-y-12">
          
          <div className="border-b-2 border-[#EBE3D5] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-50 rounded-2xl text-amber-900 font-bold text-lg">🍱</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#505A69] tracking-tight">COMIDAS</h3>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#AF9C89] font-bold">Artesanía de Sabor</span>
          </div>

          {menuSections.comidas.map((section) => (
            <div key={section.id} id={section.id} className="space-y-6 scroll-mt-28">
              
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-rose-400 rounded"></span>
                <h4 className="font-serif text-lg font-bold text-[#2F1F17]">{section.label}</h4>
              </div>

              {section.items.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay platillos que coincidan en esta categoría.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {section.items.map((item) => {
                    const cartItem = cart.find(ci => ci.item.id === item.id);
                    return (
                      <motion.div 
                        key={item.id}
                        className="bg-white rounded-3xl border border-[#F4EBE0]/75 p-5 flex flex-col justify-between hover:shadow-lg hover:border-rose-300/30 transition-all duration-300 relative group h-40"
                      >
                        <div className="space-y-2 flex-1 text-left">
                          <div className="flex justify-between items-start gap-3">
                            <h5 className="font-serif text-base font-black text-[#2F1F17] group-hover:text-rose-500 transition-colors leading-tight">
                              {item.name}
                            </h5>
                            <span className="font-serif text-sm font-bold text-[#2F1F17] shrink-0 font-mono tracking-tight bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#F1E9DC]">
                              C$ {item.price}
                            </span>
                          </div>
                          
                          <p className="text-xs text-[#5A493B] font-light leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
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

                      </motion.div>
                    );
                  })}
                </div>
              )}

            </div>
          ))}

        </div>

        {/* CATEGORÍA: BEBIDAS */}
        <div className="space-y-12 pt-8">
          
          <div className="border-b-2 border-[#EBE3D5] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-rose-50 rounded-2xl text-rose-900 font-bold text-lg">☕</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#505A69] tracking-tight">BEBIDAS</h3>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#AF9C89] font-bold">Cafetería & Limonadas</span>
          </div>

          {menuSections.bebidas.map((section) => (
            <div key={section.id} id={section.id} className="space-y-6 scroll-mt-28">
              
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-rose-400 rounded"></span>
                <h4 className="font-serif text-lg font-bold text-[#2F1F17]">{section.label}</h4>
              </div>

              {section.items.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay bebidas que coincidan en esta categoría.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {section.items.map((item) => {
                    const cartItem = cart.find(ci => ci.item.id === item.id);
                    return (
                      <motion.div 
                        key={item.id}
                        className="bg-white rounded-3xl border border-[#F4EBE0]/75 p-5 flex flex-col justify-between hover:shadow-lg hover:border-rose-300/30 transition-all duration-300 relative group h-40"
                      >
                        <div className="space-y-2 flex-1 text-left">
                          <div className="flex justify-between items-start gap-3">
                            <h5 className="font-serif text-base font-black text-[#2F1F17] group-hover:text-rose-500 transition-colors leading-tight">
                              {item.name}
                            </h5>
                            <span className="font-serif text-sm font-bold text-[#2F1F17] shrink-0 font-mono tracking-tight bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#F1E9DC]">
                              C$ {item.price}
                            </span>
                          </div>
                          
                          <p className="text-xs text-[#5A493B] font-light leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
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

                      </motion.div>
                    );
                  })}
                </div>
              )}

            </div>
          ))}

        </div>

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

      {/* ACCIÓN FLOTANTE CARRITO INFERIOR DERECHO */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 items-end">
        <motion.button 
          id="btn-cart-float"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCartOpen(true)}
          className="bg-[#2F1F17] hover:bg-rose-500 text-[#FDFBF7] p-5 rounded-full shadow-2xl flex items-center justify-center border border-[#1a100a] transition-all cursor-pointer relative"
          aria-label="Abrir carrito"
        >
          <ShoppingBag className="w-6 h-6 animate-pulse" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center font-black border-2 border-[#FDFBF7] shadow-xl">
              {totalCartCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* VENTANA MODAL EMERGENTE Y MINIMALISTA DEL CARRITO (Con Desenfoque de Fondo backdrop-blur) */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            
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
              className="relative w-full max-w-xl bg-[#FDFBF7] rounded-3xl shadow-2xl border border-[#F4EBE0] z-50 text-[#2F1F17] flex flex-col max-h-[85vh] overflow-hidden"
            >
              
              {/* Cabecera Fija de la Modal */}
              <div className="px-6 py-5 border-b border-[#F4EBE0] flex items-center justify-between shrink-0 bg-[#FDFBF7] z-10">
                <div className="flex items-center gap-2 text-[#4E5B6A]">
                  <ShoppingBag className="w-5 h-5 text-rose-400" />
                  <h3 className="font-serif text-lg font-black tracking-tight">Tu Bolsa de Amor</h3>
                  {totalCartCount > 0 && (
                    <span className="text-[10px] font-mono bg-rose-50 px-2.5 py-0.5 rounded-full text-rose-600 font-bold ml-1.5 uppercase border border-rose-100">
                      {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                    </span>
                  )}
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
              <div className="overflow-y-auto flex-1 p-6 space-y-6 scrollbar-thin scroll-smooth text-left bg-[#FDFBF7]/50">
                
                {cart.length === 0 ? (
                  /* State Vacío de Alta Categoría */
                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mx-auto border border-rose-100/50 shadow-sm animate-pulse">
                      <ShoppingBag className="w-9 h-9" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[#4E5B6A] font-black text-base font-serif">Tu bolsa está vacía</h4>
                      <p className="text-xs text-stone-400 px-6 font-light leading-relaxed max-w-xs mx-auto">
                        Inspiraciones inolvidables te esperan. Ve al menú y agrega asados, cafés o frappés del día.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-5 py-2.5 bg-[#2F1F17] hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Explorar el Menú ahora
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Listado de Artículos con Diseño Compacto y Delicado */}
                    <div className="space-y-3">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#AF9C89] uppercase font-mono pb-1 border-b border-rose-100">
                        Detalle de Platillos
                      </span>
                      
                      <div className="space-y-2.5">
                        {cart.map((cartItem) => (
                          <div 
                            key={cartItem.item.id}
                            className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#F4EBE0]/80 shadow-3xs hover:border-rose-100 transition-all"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-serif font-black text-sm text-[#2F1F17] leading-tight">
                                {cartItem.item.name}
                              </h4>
                              <span className="text-[10px] text-[#AF9C89] font-mono">
                                C$ {cartItem.item.price} c/u • Subtotal: C$ {cartItem.item.price * cartItem.quantity}
                              </span>
                            </div>

                             {/* Control de cantidad en Modal */}
                             <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-full px-2.5 py-1 shrink-0">
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
                                 <Minus className="w-3.5 h-3.5 text-stone-600" />
                               </button>
                               <span className="font-mono text-xs font-bold text-[#2F1F17] w-5 text-center select-none">
                                 {cartItem.quantity}
                               </span>
                               <button 
                                 onClick={() => updateQuantity(cartItem.item.id, 1)}
                                 className="p-0.5 hover:bg-stone-200 rounded-full text-stone-600 transition-colors cursor-pointer"
                                 aria-label="Aumentar"
                               >
                                 <Plus className="w-3.5 h-3.5 text-stone-600" />
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
                        ))}
                      </div>
                    </div>

                    {/* Formulario Rediseñado Premium */}
                    <div className="space-y-4">
                      <span className="block text-[10px] font-extrabold tracking-widest text-[#AF9C89] uppercase font-mono pb-1 border-b border-rose-100">
                        Información de Entrega
                      </span>

                      <div className="space-y-3.5">
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
                            className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-2.5 text-xs text-[#2F1F17] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition-colors shadow-3xs"
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
                              onClick={() => setDeliveryType('delivery')}
                              className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${deliveryType === 'delivery' ? 'bg-[#2F1F17] text-white shadow-xs' : 'text-stone-500 hover:bg-stone-50'}`}
                            >
                              🛵 A Domicilio / Envío
                            </button>
                            <button 
                              type="button"
                              onClick={() => setDeliveryType('llevar')}
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
                            className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-2.5 text-xs text-[#2F1F17] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition-colors shadow-3xs"
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
                            className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-2.5 text-xs text-[#2F1F17] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 transition-colors shadow-3xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Resumen Final de Costos (Estilo Premium con fondo cálido) */}
                    <div className="bg-[#FAF6EE] rounded-2xl border border-[#F4EBE0] p-4.5 space-y-3.5">
                      <div className="space-y-1.5 text-xs font-mono text-[#5A493B]">
                        <div className="flex justify-between">
                          <span>Subtotal de consumo:</span>
                          <span className="font-bold">C$ {totalCartPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🛵 Costo de envío:</span>
                          <span>{deliveryType === 'delivery' ? `C$ ${deliveryFee}` : 'Gratis'}</span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-dashed border-stone-300 flex items-center justify-between font-bold text-[#2f1f17]">
                        <span className="text-sm font-serif">Total neto del Pedido:</span>
                        <span className="text-rose-500 font-mono text-xl">C$ {grandTotalPrice}</span>
                      </div>
                    </div>

                    {/* Bloque del Botón de Confirmación Imponente */}
                    <div className="space-y-3 pt-4 border-t border-[#F4EBE0] mt-4 flex flex-col items-center">
                      <button 
                        onClick={handleCheckoutWhatsApp}
                        className="w-full sm:w-11/12 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-md shadow-emerald-700/10 hover:shadow-lg transition-all duration-300 cursor-pointer text-xs uppercase tracking-widest group"
                      >
                        <svg className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.004 2C6.48 2 2 6.48 2 12c0 1.76.46 3.42 1.27 4.88l-1.21 4.43c-.08.3.01.62.24.84.17.17.4.25.64.25.07 0 .13 0 .2-.02l4.52-1.23c1.4.74 2.97 1.15 4.58 1.15 5.52 0 10-4.48 10-10S17.52 2 12.004 2zM12 20.2c-1.51 0-2.98-.38-4.3-1.09l-.3-.16-2.58.7.72-2.6-.18-.3c-.78-1.32-1.2-2.83-1.2-4.39 0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2zm4.4-6.31c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06a6.56 6.56 0 0 1-1.92-1.18c-.71-.63-1.18-1.4-1.32-1.64-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42l-.74-1.78c-.2-.48-.4-.41-.55-.42-.14-.01-.3-.01-.46-.01a.88.88 0 0 0-.64.3c-.22.24-.84.82-.84 2s.87 2.33.99 2.49c.12.16 1.7 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.42-.58 1.62-1.13.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28z"/>
                        </svg>
                        <span className="font-sans tracking-widest whitespace-nowrap">Confirmar Pedido por WhatsApp</span>
                      </button>
                      <p className="text-[10px] text-stone-400 font-light text-center leading-normal max-w-xs px-2">
                        Serás redirigido de inmediato a WhatsApp para validar y agilizar la preparación de tu mesa en Amor y Café.
                      </p>
                    </div>
                  </>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MENÚ LATERAL DESPLEGABLE DE INFORMACIÓN Y CONTACTO (Esquina Superior Derecha) */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            
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
                <div className="p-5 border-t border-[#F4EBE0]/80 bg-stone-50 text-center text-[10px] text-stone-400 italic">
                  ❝ Sabor que enamora, café que inspira 🌸 ❞
                </div>

              </motion.div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* PIE DE PÁGINA (COZY FOOTER) */}
      <footer className="bg-[#2F1F17] text-[#FAF8F5]/80 py-16 px-6 border-t border-[#3F2B1E] text-xs font-light">
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

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#AF9C89] gap-4">
          <p>© 2026 Amor y Café Waslala. Todos los derechos reservados. Desarrollado con esmero para Waslala, Región Central de Nicaragua.</p>
          <div className="flex gap-4">
            <span className="text-rose-300 font-serif italic text-xs">Sabor que enamora, café que inspira 🌸</span>
          </div>
        </div>
      </footer>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE PLATO */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
