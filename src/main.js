import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, onSnapshot, serverTimestamp, getDocFromServer, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log("Aneeq: main.js execution started at " + new Date().toISOString());

// Added global error handler for debugging
window.addEventListener('error', (event) => {
    console.error("Global Error Caught:", event.error || event.message);
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = "System Error: " + (event.error?.message || event.message);
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 5000);
    }
});

// Global Exports - Define early for HTML onclick availability
window.toggleAuthMode = (...args) => toggleAuthMode(...args);
window.handleBasketAutoTrack = (...args) => handleBasketAutoTrack(...args);
window.handleLogin = (...args) => handleLogin(...args);
window.handleRegister = (...args) => handleRegister(...args);
window.saveProfileLocation = (...args) => saveProfileLocation(...args);
window.logout = (...args) => logout(...args);
window.showView = (...args) => showView(...args);
window.openShop = (...args) => openShop(...args);
window.buyFromFeed = (...args) => buyFromFeed(...args);
window.openBuyModal = (...args) => openBuyModal(...args);
window.closeModal = (...args) => closeModal(...args);
window.submitOrder = (...args) => submitOrder(...args);
window.handleSellerLogin = (...args) => handleSellerLogin(...args);
window.addNewProduct = (...args) => addNewProduct(...args);
window.deleteProduct = (...args) => deleteProduct(...args);
window.handleTrackOrder = (...args) => handleBasketAutoTrack(...args);
window.handleMasterLogin = (...args) => handleMasterLogin(...args);
window.masterLogout = (...args) => masterLogout(...args);
window.updateOrderStatus = (...args) => updateOrderStatus(...args);
window.deleteOrderByID = (...args) => deleteOrderByID(...args);
window.setLanguage = (...args) => setLanguage(...args);
window.filterByCategory = (...args) => filterByCategory(...args);
window.previewProductImage = (...args) => previewProductImage(...args);
window.previewStoreImage = (...args) => previewStoreImage(...args);
window.removeStoreImage = (...args) => removeStoreImage(...args);
window.saveStoreSettings = (...args) => saveStoreSettings(...args);
window.togglePass = (...args) => togglePass(...args);
window.switchMasterTab = (...args) => switchMasterTab(...args);
window.updateShopCategory = (...args) => updateShopCategory(...args);
window.applyCrop = (...args) => applyCrop(...args);
window.closeCropModal = (...args) => closeCropModal(...args);
window.editProduct = (...args) => editProduct(...args);
window.saveProductEdit = (...args) => saveProductEdit(...args);
window.closeProductEditModal = (...args) => closeProductEditModal(...args);
window.addTagToProduct = (...args) => addTagToProduct(...args);
window.removeTagFromProduct = (...args) => removeTagFromProduct(...args);

window.closeZoomModal = (...args) => closeZoomModal(...args);
window.zoomImage = (...args) => zoomImage(...args);
window.removeProductPreviewImage = (...args) => removeProductPreviewImage(...args);
window.setMainImage = (...args) => setMainImage(...args);

const firebaseConfig = {
  "projectId": "gen-lang-client-0293781004",
  "appId": "1:1002839908496:web:52aa50ad60d3aa92603815",
  "apiKey": "AIzaSyB_mOuYbRx3IHAduhIXChdXmfPM_9R4ppo",
  "authDomain": "gen-lang-client-0293781004.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-1243ade3-2460-42a3-a0ef-abfd1118c9d3",
  "storageBucket": "gen-lang-client-0293781004.firebasestorage.app",
  "messagingSenderId": "1002839908496",
  "measurementId": ""
};

// INITIALIZATION
const loader = document.getElementById('app-loader');
const hideLoader = () => {
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.classList.add('hidden'), 500);
    }
};

let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth();
} catch (e) {
    console.error("Firebase Init Error:", e);
    const loaderText = document.querySelector('#app-loader p');
    if (loaderText) loaderText.innerText = "Error initializing system. Please check your connection.";
}

let isAuthReady = false;

// Sign in anonymously
if (auth) {
    signInAnonymously(auth).catch(e => console.warn("Anonymous Auth disabled:", e.message));

    onAuthStateChanged(auth, (user) => {
        isAuthReady = true;
        console.log("Auth state changed:", user ? "Signed in" : "Signed out");
        hideLoader();
    });
} else {
    hideLoader();
}

// Timeout to hide loader anyway if auth takes too long
setTimeout(hideLoader, 5000);

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// DATA CONSTANTS
const SHOPS = [];

const MASTER_KEY = "1111";

const TRANSLATIONS = {
    en: {
        storeSettings: "Store Settings",
        storeHero: "Store Header Image",
        saveStore: "Update Store Front",
        marketplace: "All Shops",
        trackOrder: "Track Request",
        home: "Home",
        heroTitle: "Where Style Meets ",
        heroIdentity: "Identity.",
        heroText: "Welcome to aneeq, the premium marketplace for independent creators and discerning collectors.",
        enterMarketplace: "Go to All Shops",
        basket: "My Requests",
        account: "Account",
        login: "Login",
        register: "Register",
        fullName: "Full Name",
        phone: "Phone Number",
        password: "Password",
        createAccount: "Create Account",
        myProfile: "My Profile",
        contactInfo: "Contact Info",
        shippingLocation: "Shipping Location",
        updateLocation: "Update Location",
        enterLocation: "City, Neighborhood, Street No...",
        deliveryHint: "Enter your delivery location and any notes. Our team will contact you.",
        curatedExcellence: "Curated Excellence",
        curatedText: "Every shop on our platform is hand-picked for quality and originality.",
        directConnect: "Direct Connect",
        directText: "Request pieces directly from creators through our secure portal.",
        globalVision: "Global Vision",
        globalText: "Wear pieces that aren't available anywhere else in the world.",
        promoTitle: "Own items that tell a story.",
        promoText: "Moving away from fast fashion towards intentional ownership. aneeq connects you to the makers behind the craft.",
        discoverBrands: "Discover Brands",
        independentBrands: "Independent Brands",
        curatedCollections: "Curated collections from unique creators, delivered directly to you.",
        marketplaceFeed: "All Shops",
        browseProducts: "Browse products from all independent sellers in one place.",
        trackTitle: "Track Request",
        trackText: "Enter your number to see messages from Master.",
        viewStatus: "View Status",
        requestStatus: "My Purchase Requests",
        sellerLogin: "Seller Login",
        storePasskey: "Store Passkey",
        enterDashboard: "Enter Dashboard",
        storeManager: "Store Manager",
        logout: "Logout",
        addNewProduct: "Add New Product",
        productName: "Product Name",
        category: "Category (e.g. Hoodies)",
        price: "Price (IQD)",
        imageUrl: "Image URL",
        publishProduct: "Publish Product",
        inventory: "Inventory",
        masterLogin: "aneeq Master",
        authorizedOnly: "Authorized access only.",
        verifyIdentity: "Verify Identity",
        commandCenter: "Marketplace Command Center",
        totalLabel: "Total: ",
        systemOnline: "System Online",
        purchaseRequest: "Purchase Request",
        phoneLabel: "Phone Number (e.g. 0770 000 0000)",
        confirmRequest: "Confirm Request",
        toastSent: "Request Sent to Master!",
        noProducts: "No products yet.",
        noItemsMarket: "No items in the marketplace yet.",
        buyNow: "Order Now",
        backToMarket: "Back to Unique Items",
        backToHome: "Back to Home",
        phonePlaceholder: "07XX XXX XXXX",
        noOrdersFound: "No requests found for this number.",
        waitMaster: "Wait for the Master to review your request.",
        messageSent: "Message Sent:",
        removeHistory: "Remove from History",
        masterAction: "MASTER ACTION",
        typeMessage: "Type a message for the customer...",
        acceptRequest: "Accept Request",
        refuseRequest: "Refuse Request",
        accessDenied: "ACCESS_DENIED.",
        wrongKey: "Wrong key.",
        fillFields: "Fill fields",
        delete: "Delete",
        platform: "Platform",
        support: "Support",
        contactUs: "Contact Us",
        terms: "Terms of Service",
        footerText: "Redefining independent retail for the modern age.",
        all: "All",
        men: "Men",
        women: "Women",
        kids: "Kids",
        statusAccepted: "Accepted",
        statusRefused: "Refused",
        phLabel: "PH:",
        visitShop: "Visit Shop",
        backToHome: "Back to Home",
        backToMarketplace: "All Shops",
        loginToView: "Please login to view your requests.",
        goToAccount: "Go to Account",
        basketDesc: "View and track your current purchase requests.",
        showingPieces: "Showing all unique pieces",
        curatedCollectionsTitle: "Curated Collections",
        brandName: "aneeq Specials",
        rights: "All rights reserved.",
        pending: "Pending",
        locationDetails: "Location/Details:",
        edit: "Edit",
        updateProduct: "Update Product",
        description: "Description",
        tags: "Tags (Comma separated)",
    },
    ar: {
        storeSettings: "إعدادات المتجر",
        storeHero: "صورة غلاف المتجر",
        saveStore: "تحديث واجهة المتجر",
        marketplace: "كل المتاجر",
        trackOrder: "تتبع الطلبات",
        home: "الرئيسية",
        heroTitle: "حيث يلتقي الأسلوب بـ ",
        heroIdentity: "الهوية.",
        heroText: "مرحباً بكم في أنيق، المتجر المميز للمبدعين المستقلين وجامعي القطع الفريدة.",
        enterMarketplace: "عرض كل المتاجر",
        basket: "طلبات الشراء",
        account: "الحساب",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        fullName: "الاسم الكامل",
        phone: "رقم الهاتف",
        password: "كلمة المرور",
        createAccount: "إنشاء الحساب",
        myProfile: "ملفي الشخصي",
        contactInfo: "معلومات الاتصال",
        shippingLocation: "موقع الشحن",
        updateLocation: "تحديث الموقع",
        enterLocation: "المدينة، الحي، رقم الشارع...",
        deliveryHint: "أدخل موقع التوصيل وأي ملاحظات إضافية. سيتصل بك فريقنا.",
        curatedExcellence: "تميز منتقى",
        curatedText: "يتم اختيار كل متجر على منصتنا يدوياً لضمان الجودة والأصالة.",
        directConnect: "اتصال مباشر",
        directText: "اطلب القطع مباشرة من المبدعين من خلال بوابتنا الآمنة.",
        globalVision: "رؤية عالمية",
        globalText: "ارتدِ قطعاً لا تتوفر في أي مكان آخر في العالم.",
        promoTitle: "امتلك قطعاً تحكي قصة.",
        promoText: "الابتعاد عن الموضة السريعة نحو الملكية المقصودة. أنيق يربطك بالمبدعين وراء الحرفة.",
        discoverBrands: "اكتشف العلامات التجارية",
        independentBrands: "العلامات التجارية المستقلة",
        curatedCollections: "مجموعات مختارة من مبدعين فريدين، تصل إليك مباشرة.",
        marketplaceFeed: "كل المتاجر",
        browseProducts: "تصفح المنتجات من جميع البائعين المستقلين في مكان واحد.",
        trackTitle: "تتبع الطلب",
        trackText: "أدخل رقمك لرؤية رسائل الماستر.",
        viewStatus: "عرض الحالة",
        requestStatus: "طلبات الشراء الخاصة بي",
        sellerLogin: "تسجيل دخول البائع",
        storePasskey: "مفتاح مرور المتجر",
        enterDashboard: "دخول لوحة التحكم",
        storeManager: "مدير المتجر",
        logout: "تسجيل الخروج",
        addNewProduct: "إضافة منتج جديد",
        productName: "اسم المنتج",
        category: "الفئة (مثل: هوديز)",
        price: "السعر (د.ع)",
        imageUrl: "رابط الصورة",
        publishProduct: "نشر المنتج",
        inventory: "المخزون",
        masterLogin: "أنيق ماستر",
        authorizedOnly: "وصول مصرح به فقط.",
        verifyIdentity: "التحقق من الهوية",
        commandCenter: "مركز قيادة المتجر",
        totalLabel: "الإجمالي: ",
        systemOnline: "النظام متصل",
        purchaseRequest: "طلب شراء",
        phoneLabel: "رقم الهاتف (مثال: 0770 000 0000)",
        confirmRequest: "تأكيد الطلب",
        toastSent: "تم إرسال الطلب إلى الماستر!",
        noProducts: "لا توجد منتجات بعد.",
        noItemsMarket: "لا توجد عناصر في المتجر بعد.",
        buyNow: "اطلب الآن",
        backToMarket: "العودة للقطع الفريدة",
        backToHome: "العودة للرئيسية",
        phonePlaceholder: "07XX XXX XXXX",
        noOrdersFound: "لم يتم العثور على طلبات لهذا الرقم.",
        waitMaster: "يرجى انتظار مراجعة الماستر لطلبك.",
        messageSent: "الرسالة المرسلة:",
        removeHistory: "إزالة من السجل",
        masterAction: "إجراء الماستر",
        typeMessage: "اكتب رسالة للزبون...",
        acceptRequest: "قبول الطلب",
        refuseRequest: "رفض الطلب",
        accessDenied: "تم رفض الوصول.",
        wrongKey: "مفتاح خاطئ.",
        fillFields: "املأ الحقول",
        delete: "حذف",
        platform: "المنصة",
        support: "الدعم",
        contactUs: "اتصل بنا",
        terms: "شروط الخدمة",
        footerText: "إعادة تعريف التجزئة المستقلة للعصر الحديث.",
        all: "الكل",
        men: "الرجال",
        women: "النساء",
        kids: "الأطفال",
        statusAccepted: "مقبول",
        statusRefused: "مرفوض",
        phLabel: "هاتف:",
        visitShop: "عرض المتجر",
        backToHome: "العودة للرئيسية",
        backToMarketplace: "العودة لكل المتاجر",
        loginToView: "يرجى تسجيل الدخول لعرض طلبات الشراء الخاصة بك.",
        goToAccount: "الانتقال للحساب",
        basketDesc: "عرض وتتبع طلبات الشراء الحالية الخاصة بك.",
        showingPieces: "عرض جميع القطع الفريدة",
        curatedCollectionsTitle: "مجموعات مختارة",
        brandName: "عروض أنيق",
        rights: "جميع الحقوق محفوظة.",
        pending: "قيد الانتظار",
        locationDetails: "الموقع/التفاصيل:",
        edit: "تعديل",
        updateProduct: "تحديث المنتج",
        description: "الوصف",
        tags: "الوسوم (مفصولة بفاصلة)",
    }

};

// STATE
let currentView = "home";
let activeShop = null;
let loggedInShopId = localStorage.getItem('aneeq_seller_id');
let loggedInUser = null;
try {
    const savedUser = localStorage.getItem('aneeq_user');
    if (savedUser && savedUser !== 'undefined') {
        loggedInUser = JSON.parse(savedUser);
    }
} catch (e) {
    console.error("Error parsing loggedInUser from localStorage:", e);
    localStorage.removeItem('aneeq_user');
}
let trackOrdersUnsubscribe = null;
let isMasterLoggedIn = localStorage.getItem('aneeq_master_session') === 'true';
let currentProductToBuy = null;
let currentLang = localStorage.getItem('aneeq_lang') || 'ar';
let currentCategory = 'all';
const shopSettingsOverrides = {};
const PRODUCT_CACHE = {};

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Content Loaded. Initializing app...");
    try {
        // 1. Initialize real-time settings listener
        initSettingsListener();
        
        // 2. Set language
        setLanguage(currentLang);
        
        // 3. Recovery of states
        if (loggedInUser) {
            updateProfileUI();
        }

        if (loggedInShopId) {
            const id = loggedInShopId; 
            const shop = SHOPS.find(s => s.id === id);
            if (shop) {
                const sellerTools = document.getElementById('seller-tools');
                if (sellerTools) sellerTools.classList.remove('hidden');
                renderAdminInventory();
            } else {
                loggedInShopId = null;
                localStorage.removeItem('aneeq_seller_id');
            }
        }

        if (isMasterLoggedIn) {
            console.log("Master is logged in, showing dashboard");
            const masterLogin = document.getElementById('master-login');
            const masterDashboard = document.getElementById('master-dashboard');
            if (masterLogin) masterLogin.classList.add('hidden');
            if (masterDashboard) masterDashboard.classList.remove('hidden');
            renderMasterOrders();
        }
        
        // Check URL path on load
        const path = window.location.pathname.substring(1);
        const validViews = ['home', 'marketplace', 'basket', 'account', 'master'];
        if (path && validViews.includes(path)) {
            showView(path, true);
        } else {
            showView('home', true);
        }
        
        if (typeof setupAdminSelect === 'function') {
            setupAdminSelect();
        }
    } catch (e) {
        console.error("Error during app initialization:", e);
    } finally {
        // Ensure loader is hidden even if init has issues
        setTimeout(hideLoader, 1000);
    }
});

// LANGUAGE
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('aneeq_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update static strings
    updateStaticTranslations();
    
    // Re-render current view components if needed
    if(currentView === 'marketplace') {
        initMarketplace();
        renderProductFeed();
    }
    if(currentView === 'basket') handleBasketAutoTrack();
    if(currentView === 'master') renderMasterOrders();
    if(loggedInShopId) renderAdminInventory();
}

function updateStaticTranslations() {
    try {
        const t = TRANSLATIONS[currentLang];
        if (!t) return;
        
        // Nav
        const navButtons = document.querySelectorAll('.navbar nav button');
        if(navButtons.length >= 3) {
            navButtons[0].innerText = t.marketplace;
            navButtons[1].innerText = t.basket;
            navButtons[2].innerText = t.account;
        }
        
        // Account View
        const authCard = document.getElementById('account-auth');
        if(authCard) {
            const tLogin = document.getElementById('tab-login');
            const tRegister = document.getElementById('tab-register');
            if (tLogin) tLogin.innerText = t.login;
            if (tRegister) tRegister.innerText = t.register;
            
            const lp = document.getElementById('login-phone');
            const lps = document.getElementById('login-pass');
            if (lp) lp.placeholder = t.phone;
            if (lps) lps.placeholder = t.password;
            
            const loginBtn = authCard.querySelector('#form-login .btn-primary');
            if(loginBtn) loginBtn.innerText = t.login;
            
            const rn = document.getElementById('reg-name');
            const rp = document.getElementById('reg-phone');
            const rps = document.getElementById('reg-pass');
            if (rn) rn.placeholder = t.fullName;
            if (rp) rp.placeholder = t.phone;
            if (rps) rps.placeholder = t.password;
            
            const regBtn = authCard.querySelector('#form-register .btn-primary');
            if(regBtn) regBtn.innerText = t.createAccount;
        }
        
        const profileView = document.getElementById('account-profile');
        if(profileView) {
           const udn = document.getElementById('user-display-name');
           if (udn) udn.innerText = loggedInUser ? loggedInUser.name : t.myProfile;
           
           const h3s = profileView.querySelectorAll('h3');
           if (h3s.length >= 1) h3s[0].innerText = t.contactInfo;
           if (h3s.length >= 2) h3s[1].innerText = t.shippingLocation;
           
           const pl = document.getElementById('profile-location');
           if (pl) pl.placeholder = t.enterLocation;
           
           const updateLocBtn = profileView.querySelector('button[onclick="saveProfileLocation()"]');
           if(updateLocBtn) updateLocBtn.innerText = t.updateLocation;
        }

        // Basket View
        const basketView = document.getElementById('view-basket');
        if(basketView) {
            const basketTitle = document.getElementById('basket-title');
            if(basketTitle) basketTitle.innerHTML = currentLang === 'ar' ? `طلبات <span class="accent-text">الشراء</span>` : `Purchase <span class="accent-text">Requests</span>`;
            const bst = document.getElementById('basket-status-title');
            if (bst) bst.innerText = t.requestStatus;
            
            const bdesc = document.getElementById('basket-desc');
            if (bdesc) bdesc.innerText = t.basketDesc;
            
            const bat = document.getElementById('basket-auth-text');
            if (bat) bat.innerText = t.loginToView;
            
            const bab = document.getElementById('basket-auth-btn');
            if (bab) bab.innerText = t.goToAccount;
        }

        // Marketplace View Hero
        const mpHeroTag = document.getElementById('mp-hero-tag');
        const mpHeroTitle = document.getElementById('mp-hero-title');
        const mpHeroDesc = document.getElementById('mp-hero-desc');
        if (mpHeroTag) mpHeroTag.innerText = t.curatedCollectionsTitle;
        if (mpHeroTitle) mpHeroTitle.innerText = t.independentBrands;
        if (mpHeroDesc) mpHeroDesc.innerText = t.curatedCollections;
        
        const mpFeedTitle = document.getElementById('mp-feed-title');
        const mpFeedMeta = document.getElementById('mp-feed-meta');
        if (mpFeedTitle) mpFeedTitle.innerText = t.marketplaceFeed;
        if (mpFeedMeta) mpFeedMeta.innerText = t.showingPieces;

        // Back Buttons
        document.querySelectorAll('.btn-back span').forEach(span => {
            const btn = span.parentElement;
            const onclick = btn.getAttribute('onclick');
            if (onclick === "showView('home')") span.innerText = t.backToHome;
            if (onclick === "showView('marketplace')") span.innerText = t.backToMarketplace;
        });

        // Modal
        const buyModal = document.querySelector('.modal-content');
        if(buyModal) {
            const bmt = document.getElementById('buy-modal-title');
            const bmh = document.getElementById('buy-modal-hint');
            const cl = document.getElementById('customer-location');
            if (bmt) bmt.innerText = t.purchaseRequest;
            if (bmh) bmh.innerText = t.deliveryHint;
            if (cl) cl.placeholder = t.enterLocation;
            const bconfirm = buyModal.querySelector('.btn-primary');
            if (bconfirm) bconfirm.innerText = t.confirmRequest;
        }
        
        // Home
        const homeHero = document.querySelector('.home-hero');
        if(homeHero) {
            const h1 = homeHero.querySelector('h1');
            const p = homeHero.querySelector('p');
            const mpBtn = homeHero.querySelector('button[onclick="showView(\'marketplace\')"]');
            const bkBtn = document.getElementById('home-basket-btn');
            const slBtn = document.getElementById('home-seller-btn');
            
            if (h1) h1.innerHTML = `${t.heroTitle} <span class="accent-text">${t.heroIdentity}</span>`;
            if (p) p.innerText = t.heroText;
            if (mpBtn) mpBtn.innerText = t.enterMarketplace;
            if (bkBtn) bkBtn.innerText = t.basket;
        }
        
        const features = document.querySelectorAll('.feature-card');
        if(features.length >= 3) {
            const f1h = features[0].querySelector('h3');
            const f1p = features[0].querySelector('p');
            if (f1h) f1h.innerText = t.curatedExcellence;
            if (f1p) f1p.innerText = t.curatedText;
            
            const f2h = features[1].querySelector('h3');
            const f2p = features[1].querySelector('p');
            if (f2h) f2h.innerText = t.directConnect;
            if (f2p) f2p.innerText = t.directText;
            
            const f3h = features[2].querySelector('h3');
            const f3p = features[2].querySelector('p');
            if (f3h) f3h.innerText = t.globalVision;
            if (f3p) f3p.innerText = t.globalText;
        }

        const promo = document.querySelector('.home-promo');
        if(promo) {
            const h2 = promo.querySelector('h2');
            const p = promo.querySelector('p');
            const btn = promo.querySelector('button');
            if (h2) h2.innerText = t.promoTitle;
            if (p) p.innerText = t.promoText;
            if (btn) btn.innerText = t.discoverBrands;
        }
        
        // Categories
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const cat = btn.dataset.category;
            if (cat === 'all') btn.innerText = t.all;
            if (cat === 'Men') btn.innerText = t.men;
            if (cat === 'Women') btn.innerText = t.women;
            if (cat === 'Kids') btn.innerText = t.kids;
        });

        // Marketplace
        const marketplaceView = document.getElementById('view-marketplace');
        if(marketplaceView) {
            const mpHero = marketplaceView.querySelector('.hero');
            if(mpHero) {
                const h1 = mpHero.querySelector('h1');
                const p = mpHero.querySelector('p');
                if (h1) h1.innerText = t.independentBrands;
                if (p) p.innerText = t.curatedCollections;
            }
            const mpFeedHeader = marketplaceView.querySelector('.feed-header');
            if(mpFeedHeader) {
                const h2 = mpFeedHeader.querySelector('h2');
                if (h2) h2.innerText = t.marketplaceFeed;
            }
        }
        
        // Seller Admin
        const adminLogin = document.getElementById('admin-login');
        if(adminLogin) {
            const h2 = adminLogin.querySelector('h2');
            const p = adminLogin.querySelector('p');
            const passInput = document.getElementById('admin-pass');
            const btn = adminLogin.querySelector('button');
            if (h2) h2.innerText = t.sellerLogin;
            if (passInput) passInput.placeholder = t.storePasskey;
            if (btn) btn.innerText = t.enterDashboard;
        }
        const adminDashboard = document.getElementById('seller-tools');
        if(adminDashboard) {
            const logoutBtn = adminDashboard.querySelector('.btn-outline');
            if (logoutBtn) logoutBtn.innerText = t.logout;
            
            const settingsCard = adminDashboard.querySelector('.admin-settings-card');
            if(settingsCard) {
                const h3 = settingsCard.querySelector('h3');
                if (h3) h3.innerText = t.storeSettings;
                const labels = settingsCard.querySelectorAll('label');
                if (labels.length >= 1) labels[0].innerText = currentLang === 'ar' ? 'اسم المتجر' : 'Store Display Name';
                const sni = document.getElementById('store-name-input');
                if (sni) sni.placeholder = currentLang === 'ar' ? 'أدخل اسم المتجر' : 'Enter Store Name';
                const ut = settingsCard.querySelector('.upload-text');
                if (ut) ut.innerText = t.storeHero;
                const saveBtn = settingsCard.querySelector('.btn-primary');
                if (saveBtn) saveBtn.innerText = t.saveStore;

                // Pre-fill current name from memory or SHOPS
                const shop = SHOPS.find(s => s.id === loggedInShopId);
                const currentName = shopSettingsOverrides[loggedInShopId]?.name || shop?.name || "";
                if (sni) sni.value = currentName;
            }

            const cardis = adminDashboard.querySelectorAll('.cardi');
            if (cardis.length >= 2) {
                const h3Add = cardis[0].querySelector('h3');
                if (h3Add) h3Add.innerText = t.addNewProduct;
                const hn = document.getElementById('p-name');
                const hp = document.getElementById('p-price');
                if (hn) hn.placeholder = t.productName;
                if (hp) hp.placeholder = t.price;
                const pubBtn = cardis[0].querySelector('.admin-form button');
                if (pubBtn) pubBtn.innerText = t.publishProduct;

                const h3Inv = cardis[1].querySelector('h3');
                if (h3Inv) h3Inv.innerText = t.inventory;
            }

            const catSelect = document.getElementById('p-cat');
            if (catSelect && catSelect.options.length >= 4) {
                catSelect.options[0].text = currentLang === 'ar' ? 'اختر الفئة' : 'Select Category';
                catSelect.options[1].text = t.men;
                catSelect.options[2].text = t.women;
                catSelect.options[3].text = t.kids;
            }
        }
        
        // Master Admin
        const masterLogin = document.getElementById('master-login');
        if(masterLogin) {
            const h2 = masterLogin.querySelector('h2');
            const p = masterLogin.querySelector('p');
            const btn = masterLogin.querySelector('button');
            const mpk = document.getElementById('master-pass');
            if (h2) h2.innerText = t.masterLogin;
            if (p) p.innerText = t.authorizedOnly;
            if (mpk) mpk.placeholder = t.verifyIdentity;
            if (btn) btn.innerText = t.verifyIdentity;
        }
        const masterDashboard = document.getElementById('master-dashboard');
        if(masterDashboard) {
            const h2 = masterDashboard.querySelector('h2');
            if (h2) h2.innerText = t.commandCenter;
        }
        
        // Toast
        const toast = document.getElementById('toast');
        if (toast) toast.innerText = t.toastSent;

        // Edit Modal
        const editModal = document.getElementById('product-edit-modal');
        if (editModal) {
            const title = document.getElementById('edit-product-title');
            if (title) title.innerText = t.updateProduct;
            const labels = editModal.querySelectorAll('label');
            if (labels.length >= 4) {
                labels[0].innerText = t.productName;
                labels[1].innerText = t.category;
                labels[2].innerText = t.price;
                labels[3].innerText = t.description;
                labels[4].innerText = t.tags;
            }
            const updateBtn = editModal.querySelector('.btn-primary');
            if (updateBtn) updateBtn.innerText = t.updateProduct;
        }
        
        // Footer
        const footer = document.querySelector('footer');
        if(footer) {
            const fp = footer.querySelector('.footer-brand p');
            const fhl = footer.querySelectorAll('.footer-links h4');
            const flButtons = footer.querySelectorAll('.footer-links button');
            const flh = footer.querySelector('.footer-legal h4');
            const flp = footer.querySelectorAll('.footer-legal p');
            const fb = footer.querySelector('.footer-bottom');

            if (fp) fp.innerText = t.footerText;
            if (fhl.length >= 1) fhl[0].innerText = t.platform;
            
            // Map buttons to their translations based on their onclick handlers
            flButtons.forEach(btn => {
                const handler = btn.getAttribute('onclick');
                if (handler === "showView('home')") btn.innerText = t.home;
                else if (handler === "showView('marketplace')") btn.innerText = t.marketplace;
                else if (handler === "showView('account')") btn.innerText = t.account;
                else if (handler === "showView('basket')") btn.innerText = t.basket;
            });

            if (flh) flh.innerText = t.support;
            if (flp.length >= 2) {
                flp[0].innerText = t.contactUs;
                flp[1].innerText = t.terms;
            }
            if (fb) fb.innerText = `© 2026 ${t.brandName}. ${t.rights}`;
        }
    } catch (e) {
        console.error("Error in updateStaticTranslations:", e);
    }
}


// Listen for back/forward navigation
window.addEventListener('popstate', (event) => {
    const viewId = event.state?.viewId || 'home';
    showView(viewId, true);
});

// ROUTING
function showView(viewId, skipState = false) {
    currentView = viewId;
    
    if (!skipState) {
        const url = viewId === 'home' ? '/' : '/' + viewId;
        history.pushState({ viewId }, '', url);
    }
    
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`view-${viewId}`);
    if(target) target.classList.remove('hidden');
    
    if(viewId === 'basket') {
        handleBasketAutoTrack();
    }
    
    if(viewId === 'marketplace') {
        initMarketplace();
        renderProductFeed();
    }
    if(viewId === 'master') renderMasterOrders();
    
    window.scrollTo(0,0);
}

// UTILITIES
function initSettingsListener() {
    if (!db) return;
    onSnapshot(collection(db, "shop_settings"), (snapshot) => {
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.shopId) {
                shopSettingsOverrides[data.shopId] = data;
            }
        });
        
        // Update UI dynamically
        if (loggedInShopId) {
            const shop = SHOPS.find(s => s.id === loggedInShopId);
            const displayName = shopSettingsOverrides[loggedInShopId]?.name || shop?.name;
            const el = document.getElementById('admin-store-name');
            if (el) el.innerText = displayName;
            updateProfileUI();
        }

        if (currentView === 'marketplace') {
            initMarketplace();
        }

        if (currentView === 'shop' && activeShop) {
            const heroImage = shopSettingsOverrides[activeShop.id]?.hero || activeShop.hero;
            const shopName = shopSettingsOverrides[activeShop.id]?.name || activeShop.name;
            const heroEl = document.querySelector('#view-shop .hero');
            if (heroEl) {
                heroEl.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${heroImage}')`;
                const h1 = heroEl.querySelector('h1');
                if (h1) h1.innerText = shopName;
            }
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "shop_settings");
    });
}

function initMarketplace() {
    const list = document.getElementById('shops-list');
    if (!list) return;

    const filteredShops = SHOPS.filter(shop => {
        const shopCat = shopSettingsOverrides[shop.id]?.category || shop.category;
        if (!shopCat) return false; // Hide uncategorized stores
        return currentCategory === 'all' || shopCat === currentCategory;
    });

    list.innerHTML = filteredShops.map(shop => {
        const t = TRANSLATIONS[currentLang];
        const shopName = shopSettingsOverrides[shop.id]?.name || shop.name;
        const shopLogo = shopSettingsOverrides[shop.id]?.logo || shop.logo;
        return `
            <div class="shop-card" onclick="openShop('${shop.id}')">
                <div class="shop-frame">
                    <div class="shop-card-content">
                        <img src="${shopLogo}" class="shop-logo" alt="${shopName} logo">
                        <div class="shop-info">
                            <h3>${shopName}</h3>
                            <div class="shop-hint">${t.visitShop}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterByCategory(cat) {
    currentCategory = cat;
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.category === cat) {
            btn.classList.add('active');
        }
    });
    initMarketplace();
    renderProductFeed();
}

let productFeedUnsubscribe = null;

function renderProductFeed() {
    if (!db) return;
    if (productFeedUnsubscribe) productFeedUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const feedContainer = document.getElementById('marketplace-feed');
    if(!feedContainer) return;

    // Use onSnapshot for real-time updates
    const q = query(collection(db, "inventory"));
    productFeedUnsubscribe = onSnapshot(q, (snapshot) => {
        let allProducts = [];
        snapshot.forEach(doc => {
            const p = { ...doc.data(), id: doc.id };
            PRODUCT_CACHE[p.id] = p;
            if(currentCategory === 'all' || p.category === currentCategory) {
                const shop = SHOPS.find(s => s.id === p.shopId);
                if(shop) {
                    const shopName = shopSettingsOverrides[p.shopId]?.name || shop.name;
                    const shopLogo = shopSettingsOverrides[p.shopId]?.logo || shop.logo;
                    allProducts.push({ ...p, shopName, shopLogo });
                }
            }
        });

        if(allProducts.length === 0) {
            feedContainer.innerHTML = `<p style="text-align:center; color:#999; padding:40px; grid-column: 1/-1;">${t.noItemsMarket}</p>`;
            return;
        }

        // Shuffle for variety if 'all', otherwise sort by recent
        if(currentCategory === 'all') {
            allProducts.sort(() => Math.random() - 0.5);
        } else {
            allProducts.reverse();
        }

        feedContainer.innerHTML = allProducts.map(p => `
            <div class="product-card" onclick="openBuyModal('${p.id}')">
                <div class="product-info-top">
                    <div class="product-meta">
                        <span class="product-shop-tag" onclick="event.stopPropagation(); openShop('${p.shopId}')">
                            ${p.shopName}
                        </span>
                    </div>
                    <h3>${p.name}</h3>
                </div>
                <div class="product-img-wrapper">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="product-info-bottom">
                    <div style="padding: 10px 15px; border-top: 1px solid #f9f9f9;">
                         ${p.description ? `<p style="font-size: 11px; color: #666; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px;">${p.description}</p>` : ''}
                         <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                            ${(p.tags || []).map(tag => `<span class="product-tag">${tag}</span>`).join('')}
                         </div>
                    </div>
                    <div class="product-card-footer">
                        <div class="product-price">${p.price} د.ع</div>
                        <button class="btn-buy-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "inventory");
    });
}

function buyFromFeed(shopId, pId) {
    openBuyModal(pId);
}

// SHOP DETAIL
function openShop(shopId) {
    const shop = SHOPS.find(s => s.id === shopId);
    activeShop = shop;
    showView('shop');
    
    const heroImage = shopSettingsOverrides[shopId]?.hero || shop?.hero;
    const shopLogo = shopSettingsOverrides[shopId]?.logo || shop?.logo;
    const shopName = shopSettingsOverrides[shopId]?.name || shop?.name;
    
    document.getElementById('shop-header-container').innerHTML = `
        <div class="hero" style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${heroImage}') center/cover; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;">
            <img src="${shopLogo}" style="width: 80px; height: 80px; border-radius: 20px; border: 2px solid #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
            <h1>${shopName}</h1>
        </div>
    `;
    
    renderProducts(shopId);
}

let shopProductsUnsubscribe = null;

function renderProducts(shopId) {
    if (!db) return;
    if (shopProductsUnsubscribe) shopProductsUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById('shop-products-container');
    
    // Back to Market text
    const backBtnText = document.querySelector('#view-shop .btn-back span');
    if(backBtnText) backBtnText.innerText = t.backToMarket;

    // Marketplace and basket back buttons
    const mBack = document.querySelector('#view-marketplace .btn-back span');
    if(mBack) mBack.innerText = t.backToHome;
    const bBack = document.querySelector('#view-basket .btn-back span');
    if(bBack) bBack.innerText = t.backToHome;

    const q = query(collection(db, "inventory"), where("shopId", "==", shopId));
    shopProductsUnsubscribe = onSnapshot(q, (snapshot) => {
        let shopProducts = [];
        snapshot.forEach(doc => {
            const p = { ...doc.data(), id: doc.id };
            PRODUCT_CACHE[p.id] = p;
            shopProducts.push(p);
        });

        if(shopProducts.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">${t.noProducts}</p>`;
            return;
        }

        container.innerHTML = shopProducts.map(p => `
            <div class="product-card" onclick="openBuyModal('${p.id}')">
                <div class="product-info-top">
                    <h3>${p.name}</h3>
                </div>
                <div class="product-img-wrapper">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="product-info-bottom">
                    <div style="padding: 10px 15px; border-top: 1px solid #f9f9f9;">
                         ${p.description ? `<p style="font-size: 11px; color: #666; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px;">${p.description}</p>` : ''}
                         <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                            ${(p.tags || []).map(tag => `<span class="product-tag">${tag}</span>`).join('')}
                         </div>
                    </div>
                    <div class="product-card-footer">
                        <div class="product-price">${p.price} د.ع</div>
                        <button class="btn-buy-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "inventory");
    });
}

// BUY MODAL
function openBuyModal(productId) {
    const p = PRODUCT_CACHE[productId];
    if (!p) return;
    
    currentProductToBuy = p;
    const images = p.images || [p.image];
    
    document.getElementById('modal-product-info').innerHTML = `
        <div style="margin-bottom:20px;">
            <div style="margin-bottom:15px;">
                <div id="modal-gallery" style="width: 100%; position: relative; border-radius: 12px; overflow: hidden; background: #f9f9f9; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center; cursor: zoom-in;" onclick="zoomImage(currentGalleryImage || '${images[0]}')">
                    <img id="main-modal-img" src="${images[0]}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                ${images.length > 1 ? `
                    <div style="display: flex; gap: 8px; margin-top: 10px; overflow-x: auto; padding-bottom: 5px;">
                        ${images.map((img, i) => `
                            <img src="${img}" onclick="event.stopPropagation(); updateModalGallery('${img}')" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover; border: 2px solid ${i === 0 ? '#000' : 'transparent'}; cursor: pointer;">
                        `).join('')}
                    </div>
                ` : ''}
                <div style="margin-top: 15px;">
                    <h3 style="margin:0; font-family:var(--font-serif); font-size:24px; font-weight: 700;">${p.name}</h3>
                    <div style="color:var(--accent); font-weight:700; font-size:20px; margin-top: 4px;">${p.price} د.ع</div>
                </div>
            </div>
            ${p.description ? `<p style="font-size:14px; color:#666; line-height:1.6; margin-bottom:15px;">${p.description}</p>` : ''}
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                ${(p.tags || []).map(t => `<span class="product-tag">${t}</span>`).join('')}
            </div>
        </div>
    `;
    
    window.currentGalleryImage = images[0];
    window.updateModalGallery = (src) => {
        const main = document.getElementById('main-modal-img');
        if (main) main.src = src;
        window.currentGalleryImage = src;
        // Highlight active thumbnail
        document.querySelectorAll('#modal-gallery + div img').forEach(img => {
            img.style.borderColor = (img.src === src || img.getAttribute('src') === src) ? '#000' : 'transparent';
        });
    };
    
    // Pre-fill location if user is logged in
    if(loggedInUser && loggedInUser.location) {
        document.getElementById('customer-location').value = loggedInUser.location;
    }
    
    document.getElementById('buy-modal').classList.remove('hidden');

    // Optimize for mobile: scroll down to ordering fields if modal is long
    if (window.innerWidth < 600) {
        setTimeout(() => {
            const modalContent = document.querySelector('#buy-modal .modal-content');
            if (modalContent) {
                modalContent.scrollTo({
                    top: modalContent.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 300);
    }
}

function closeModal() {
    document.getElementById('buy-modal').classList.add('hidden');
}

async function submitOrder() {
    if (!db) return;
    const t = TRANSLATIONS[currentLang];
    const location = document.getElementById('customer-location').value;
    if(!location) return alert(currentLang === 'ar' ? "يرجى إدخال الموقع" : "Please enter location");
    
    // Check if logged in to get user details
    if(!loggedInUser) {
        alert(currentLang === 'ar' ? "يرجى تسجيل الدخول أولاً" : "Please login to place an order");
        showView('account');
        closeModal();
        return;
    }

    const shop = SHOPS.find(s => s.id === currentProductToBuy.shopId);
    const shopDisplayName = shopSettingsOverrides[currentProductToBuy.shopId]?.name || shop?.name || 'Unknown Store';
    
    const orderData = {
        productName: currentProductToBuy.name,
        price: Number(currentProductToBuy.price),
        shopName: shopDisplayName,
        shopId: currentProductToBuy.shopId,
        phone: loggedInUser.phone,
        customerName: loggedInUser.name,
        location: location,
        userId: loggedInUser.phone, // using phone as ID for simplicity in this demo logic
        time: new Date().toLocaleString(),
        status: 'pending',
        masterMessage: '',
        createdAt: serverTimestamp()
    };
    
    try {
        await addDoc(collection(db, "orders"), orderData);
        closeModal();
        showToast();
        
        // Update user location if it was empty
        if(!loggedInUser.location) {
            loggedInUser.location = location;
            saveProfileLocation(true);
        }

        // Redirect to Basket (Purchase Requests) to see the order
        setTimeout(() => showView('basket'), 1500);
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "orders");
    }
}

function showToast(message) {
    const t = document.getElementById('toast');
    if (message) t.innerText = message;
    t.classList.remove('hidden');
    setTimeout(() => {
        t.classList.add('hidden');
        // Reset to default message for other uses
        setTimeout(() => { t.innerText = "Request Sent to Master!"; }, 500);
    }, 4000);
}

const EYE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;

function togglePass(id) {
    const input = document.getElementById(id);
    if (!input) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    const btn = input.nextElementSibling;
    if (btn && btn.tagName === 'BUTTON') {
        btn.innerHTML = isPassword ? EYE_OFF_ICON : EYE_ICON;
    }
}

// ACCOUNT & AUTH
function toggleAuthMode(mode) {
    console.log("Toggling auth mode to:", mode);
    const loginTab = document.getElementById('tab-login');
    const regTab = document.getElementById('tab-register');
    const loginForm = document.getElementById('form-login');
    const regForm = document.getElementById('form-register');
    
    if(mode === 'login') {
        if (loginTab) {
            loginTab.style.fontWeight = '700';
            loginTab.style.borderBottom = '2px solid #000';
            loginTab.style.color = '#000';
        }
        if (regTab) {
            regTab.style.fontWeight = '400';
            regTab.style.borderBottom = 'none';
            regTab.style.color = '#999';
        }
        if (loginForm) loginForm.classList.remove('hidden');
        if (regForm) regForm.classList.add('hidden');
    } else {
        if (regTab) {
            regTab.style.fontWeight = '700';
            regTab.style.borderBottom = '2px solid #000';
            regTab.style.color = '#000';
        }
        if (loginTab) {
            loginTab.style.fontWeight = '400';
            loginTab.style.borderBottom = 'none';
            loginTab.style.color = '#999';
        }
        if (regForm) regForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
    }
}

async function handleRegister() {
    console.log("handleRegister started");
    if (!db) {
        alert("System error: Database not connected. Please refresh.");
        return;
    }
    
    // We don't block on isAuthReady anymore as Firestore handles its own readiness,
    // but we log status for debugging.
    console.log("Current auth ready state:", isAuthReady);

    const name = document.getElementById('reg-name').value.trim();
    const phoneInput = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    
    if(!name || !phoneInput || !pass) {
        showToast(currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : "Please fill all fields");
        return;
    }
    
    let phone = normalizePhone(phoneInput);
    if (phone.length < 10) {
        showToast(currentLang === 'ar' ? 'رقم هاتف غير صالح' : "Invalid phone number.");
        return;
    }
    
    console.log("Attempting to register user with phone:", phone);
    
    try {
        const userRef = doc(db, "users", phone);
        console.log("Checking if user exists...");
        const userDoc = await getDoc(userRef);
        
        if(userDoc.exists()) {
            console.log("User already exists");
            showToast(currentLang === 'ar' ? 'رقم الهاتف مسجل بالفعل' : "Phone number already registered.");
            return;
        }
        
        const userData = {
            name,
            phone,
            password: pass,
            location: "",
            createdAt: serverTimestamp()
        };
        
        console.log("Creating user doc...");
        await setDoc(userRef, userData);
        console.log("User registered successfully");
        showToast(currentLang === 'ar' ? 'تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول' : "Account created successfully! Please login.");
        
        // Reset fields
        document.getElementById('reg-name').value = '';
        document.getElementById('reg-phone').value = '';
        document.getElementById('reg-pass').value = '';
        
        setTimeout(() => toggleAuthMode('login'), 2000);
    } catch (e) {
        console.error("Critical registration error:", e);
        handleFirestoreError(e, OperationType.WRITE, 'users');
        showToast("Error: " + (e.code || e.message));
    }
}

async function handleLogin() {
    console.log("handleLogin started");
    if (!db) {
        alert("System error: Database not connected. Please refresh.");
        return;
    }
    
    // Non-blocking log
    console.log("Auth ready during login:", isAuthReady);

    const phoneInput = document.getElementById('login-phone').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    
    if(!phoneInput || !pass) {
        showToast(currentLang === 'ar' ? 'يرجى إدخال الهاتف وكلمة المرور' : "Please enter phone and password");
        return;
    }
    
    let phone = normalizePhone(phoneInput);
    console.log("Attempting login for:", phone);
    
    try {
        const userDoc = await getDoc(doc(db, "users", phone));
        if(userDoc.exists()) {
            const data = userDoc.data();
            if(data.password === pass) {
                console.log("Password match for user");
                loggedInUser = data;
                localStorage.setItem('aneeq_user', JSON.stringify(data));
                
                // Also check if this user is a seller
                if (data.shopId) {
                    loggedInShopId = data.shopId;
                } else {
                    const sellerShop = SHOPS.find(s => s.pass === pass && s.phone === phone);
                    if(sellerShop) {
                        loggedInShopId = sellerShop.id;
                        // Persist link to user doc for future logins
                        updateDoc(doc(db, "users", phone), { shopId: loggedInShopId }).catch(console.error);
                        loggedInUser.shopId = loggedInShopId;
                    }
                }
                
                if (loggedInShopId) {
                    localStorage.setItem('aneeq_seller_id', loggedInShopId);
                }
                
                loginSuccess();
                return;
            } else {
                console.log("Password mismatch");
            }
        } else {
            console.log("User not found in Firestore users coll");
        }
        
        const legacyShop = SHOPS.find(s => s.pass === pass && s.phone === phone);
        if(legacyShop) {
             console.log("Login matched legacy shop pass and phone");
             loggedInShopId = legacyShop.id;
             loggedInUser = { name: legacyShop.name, phone: phone, location: "", shopId: loggedInShopId };
             localStorage.setItem('aneeq_user', JSON.stringify(loggedInUser));
             localStorage.setItem('aneeq_seller_id', loggedInShopId);
             
             // Create user doc so phone/pass persist
             setDoc(doc(db, "users", phone), {
                 name: legacyShop.name,
                 phone: phone,
                 password: pass,
                 location: "",
                 shopId: loggedInShopId,
                 createdAt: serverTimestamp()
             }).catch(console.error);

             loginSuccess();
             return;
        }

        showToast(currentLang === 'ar' ? 'هاتف أو كلمة مرور غير صالحة' : "Invalid phone or password.");
    } catch (e) {
        console.error("Critical login error:", e);
        handleFirestoreError(e, OperationType.GET, 'users');
        showToast("Login Error: " + (e.code || e.message));
    }
}

function normalizePhone(phone) {
    // Remove all non-numeric characters except +
    let clean = phone.replace(/[^\d+]/g, '');
    
    // If it starts with 0 and isn't + prefixed, replace with 964
    if(clean.startsWith('0')) {
        clean = '964' + clean.substring(1);
    }
    
    // Ensure it has 964 prefix if it doesn't have + or 964
    if(!clean.startsWith('+') && !clean.startsWith('964')) {
        clean = '964' + clean;
    }
    
    // Ensure + prefix
    if(!clean.startsWith('+')) {
        clean = '+' + clean;
    }
    
    return clean;
}

function loginSuccess() {
    document.getElementById('account-auth').classList.add('hidden');
    document.getElementById('account-profile').classList.remove('hidden');
    updateProfileUI();
    
    if(loggedInShopId) {
        const sellerTools = document.getElementById('seller-tools');
        if (sellerTools) {
            sellerTools.classList.remove('hidden');
        }
        renderAdminInventory();
    }
    
    // Refresh basket tracking if view is active
    if (currentView === 'basket') {
        handleBasketAutoTrack();
    }
    
    showToast();
}

function updateProfileUI() {
    if(!loggedInUser) return;
    document.getElementById('account-auth').classList.add('hidden');
    document.getElementById('account-profile').classList.remove('hidden');
    
    document.getElementById('user-display-name').innerText = loggedInUser.name;
    document.getElementById('profile-info-display').innerHTML = `
        <p style="margin-bottom: 5px;"><strong>Phone:</strong> ${loggedInUser.phone}</p>
        <p style="font-size: 13px; color: #666;">Account active.</p>
    `;
    if(loggedInUser.location) {
        document.getElementById('profile-location').value = loggedInUser.location;
    }

    if (loggedInShopId) {
        const settings = shopSettingsOverrides[loggedInShopId] || {};
        const shop = SHOPS.find(s => s.id === loggedInShopId);
        
        const currentName = settings.name || shop?.name || "My Shop";
        const logo = settings.logo || shop?.logo || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200";
        const hero = settings.hero || shop?.hero || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200";
        
        document.getElementById('store-name-input').value = currentName;
        document.getElementById('store-phone-input').value = loggedInUser.phone;
        document.getElementById('store-pass-input').value = loggedInUser.password;
        
        const lpc = document.getElementById('logo-preview-container');
        const hpc = document.getElementById('hero-preview-container');
        if (lpc) lpc.innerHTML = `<img src="${logo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        if (hpc) hpc.innerHTML = `<img src="${hero}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;

        const removeLogoBtn = document.getElementById('remove-logo-btn');
        const removeHeroBtn = document.getElementById('remove-hero-btn');
        if (removeLogoBtn) {
            if (settings.logo) removeLogoBtn.classList.remove('hidden');
            else removeLogoBtn.classList.add('hidden');
        }
        if (removeHeroBtn) {
            if (settings.hero) removeHeroBtn.classList.remove('hidden');
            else removeHeroBtn.classList.add('hidden');
        }
    }
}

async function saveProfileLocation(silent = false) {
    if(!db || !loggedInUser) return;
    const loc = document.getElementById('profile-location').value.trim();
    
    try {
        await updateDoc(doc(db, "users", loggedInUser.phone), { location: loc });
        loggedInUser.location = loc;
        localStorage.setItem('aneeq_user', JSON.stringify(loggedInUser));
        if(!silent) showToast(currentLang === 'ar' ? "تم تحديث الموقع!" : "Location updated!");
    } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'users');
        showToast("Error updating location");
    }
}

// SELLER ADMIN
function setupAdminSelect() {
    const sel = document.getElementById('admin-shop-select');
    if(sel) sel.style.display = 'none';
}

function handleSellerLogin() {
    showView('account');
    if (loggedInUser && !loggedInShopId) {
        showToast(currentLang === 'ar' ? 'أنت مسجل دخول كمستخدم. للوصول للبوابة، استخدم مفتاح المتجر.' : "Logged in as user. To access portal, use store key as password.");
    }
}

function logout() {
    loggedInShopId = null;
    loggedInUser = null;
    localStorage.removeItem('aneeq_seller_id');
    localStorage.removeItem('aneeq_user');
    document.getElementById('account-auth').classList.remove('hidden');
    document.getElementById('account-profile').classList.add('hidden');
    document.getElementById('seller-tools').classList.add('hidden');
    
    document.getElementById('login-phone').value = '';
    document.getElementById('login-pass').value = '';
}

let adminInventoryUnsubscribe = null;

function renderAdminInventory() {
    if (!db) return;
    if (adminInventoryUnsubscribe) adminInventoryUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const list = document.getElementById('admin-inventory-list');
    
    const q = query(collection(db, "inventory"), where("shopId", "==", loggedInShopId));
    adminInventoryUnsubscribe = onSnapshot(q, (snapshot) => {
        let products = [];
        snapshot.forEach(doc => products.push({ ...doc.data(), id: doc.id }));

        list.innerHTML = products.map((p) => `
            <div style="display:flex; align-items:center; gap: 15px; padding:15px 0; border-bottom:1px solid #eee;">
                <img src="${p.image}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; border: 1px solid #000;">
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:14px;">${p.name}</div>
                    <div style="font-size:12px; color:#999;">${p.price} د.ع</div>
                    <div style="display: flex; gap: 4px; margin-top: 4px;">
                        ${(p.tags || []).map(t => `<span class="product-tag" style="padding: 2px 6px; font-size: 8px;">${t}</span>`).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="editProduct('${p.id}')" style="color:#2196F3; border:none; background:none; cursor:pointer; font-weight:600; font-size:13px; padding: 5px;">Edit</button>
                    <button onclick="deleteProduct('${p.id}')" style="color:#ff4444; border:none; background:none; cursor:pointer; font-weight:600; font-size:13px; padding: 5px;">${t.delete}</button>
                </div>
            </div>
        `).join('') || `<p style="color:#999; text-align:center; padding:40px;">${t.noProducts}</p>`;
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "inventory");
    });
}

// UTILITIES
async function compressImage(base64Str, maxWidth = 1024, quality = 0.6) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Fill white background for JPEGs (transparency fix)
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            
            ctx.drawImage(img, 0, 0, width, height);
            // Using image/jpeg for smaller file sizes compared to png
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(base64Str);
    });
}

let currentBase64Images = []; // Array for multiple photos
let currentProductTags = []; // Interactive tags for new product
let currentEditProductTags = []; // Interactive tags for editing product
let imageCropQueue = []; // Queue for multiple image cropping
let currentStoreLogo = null;
let currentStoreHero = null;

let cropperInstance = null;
let cropperType = null; // 'product', 'logo', 'hero'

function openCropper(imageSrc, type) {
    cropperType = type;
    const modal = document.getElementById('crop-modal');
    const image = document.getElementById('cropper-image');
    image.src = imageSrc;
    
    modal.classList.remove('hidden');
    
    if (cropperInstance) cropperInstance.destroy();
    
    // Set aspect ratio based on type
    let aspectRatio = 1; // Default square (logo/product)
    if (type === 'hero') aspectRatio = 16 / 9; // Hero is wide
    
    cropperInstance = new Cropper(image, {
        aspectRatio: aspectRatio,
        viewMode: 2,
        autoCropArea: 1,
    });
}

function closeCropModal() {
    document.getElementById('crop-modal').classList.add('hidden');
    if (cropperInstance) {
        cropperInstance.destroy();
        cropperInstance = null;
    }
}

async function applyCrop() {
    if (!cropperInstance) return;
    
    const canvas = cropperInstance.getCroppedCanvas();
    const croppedImage = canvas.toDataURL('image/jpeg', 0.8);
    
    if (cropperType === 'product') {
        currentBase64Images.push(croppedImage);
        renderProductPreviews();
        closeCropModal();
        // Check if more images in queue
        processNextCrop();
    } else if (cropperType === 'logo') {
        currentStoreLogo = croppedImage;
        const preview = document.getElementById('logo-preview-container');
        if (preview) {
            preview.innerHTML = `<img src="${croppedImage}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        }
        const removeBtn = document.getElementById('remove-logo-btn');
        if (removeBtn) removeBtn.classList.remove('hidden');
    } else if (cropperType === 'hero') {
        currentStoreHero = croppedImage;
        const preview = document.getElementById('hero-preview-container');
        if (preview) {
            preview.innerHTML = `<img src="${croppedImage}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">`;
        }
        const removeBtn = document.getElementById('remove-hero-btn');
        if (removeBtn) removeBtn.classList.remove('hidden');
    }
    
    closeCropModal();
}

function removeStoreImage(type) {
    if (type === 'logo') {
        currentStoreLogo = ""; // Signal removal/reset in save
        const preview = document.getElementById('logo-preview-container');
        const shop = SHOPS.find(s => s.id === loggedInShopId);
        const defaultLogo = shop?.logo || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200";
        if (preview) preview.innerHTML = `<img src="${defaultLogo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; opacity: 0.5;">`;
        const btn = document.getElementById('remove-logo-btn');
        if (btn) btn.classList.add('hidden');
    } else if (type === 'hero') {
        currentStoreHero = ""; // Signal removal/reset in save
        const preview = document.getElementById('hero-preview-container');
        const shop = SHOPS.find(s => s.id === loggedInShopId);
        const defaultHero = shop?.hero || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200";
        if (preview) preview.innerHTML = `<img src="${defaultHero}" style="width:100%; height:100%; object-fit:cover; border-radius:12px; opacity: 0.5;">`;
        const btn = document.getElementById('remove-hero-btn');
        if (btn) btn.classList.add('hidden');
    }
}

async function previewStoreImage(input, type) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            openCropper(e.target.result, type);
        };
        reader.readAsDataURL(file);
    }
}

async function saveStoreSettings() {
    const newName = document.getElementById('store-name-input').value.trim();
    const newPhone = normalizePhone(document.getElementById('store-phone-input').value.trim());
    const newPass = document.getElementById('store-pass-input').value.trim();
    
    if (!loggedInShopId || !loggedInUser) return;

    const btn = document.querySelector('.admin-settings-card .btn-primary');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = currentLang === 'ar' ? 'جاري الحفظ...' : 'Saving...';

    try {
        const updateData = {
            shopId: loggedInShopId,
            updatedAt: serverTimestamp()
        };
        if (newName) updateData.name = newName;
        if (currentStoreLogo !== null) updateData.logo = currentStoreLogo;
        if (currentStoreHero !== null) updateData.hero = currentStoreHero;
        
        // Update user profile in Firestore
        const oldPhone = loggedInUser.phone;
        const userUpdates = {
            name: newName || loggedInUser.name,
            password: newPass || loggedInUser.password,
            shopId: loggedInShopId
        };
        
        // If phone changed, it's a bit more complex since ID is the phone
        if (newPhone !== oldPhone && newPhone.length >= 10) {
             const newUserRef = doc(db, "users", newPhone);
             const newUserDoc = await getDoc(newUserRef);
             if (newUserDoc.exists()) {
                 showToast(currentLang === 'ar' ? "رقم الهاتف الجديد مستخدم بالفعل" : "New phone number is already in use.");
                 throw new Error("Phone occupied");
             }
             
             // Transfer data to new phone doc
             const fullNewUserData = { ...loggedInUser, ...userUpdates, phone: newPhone };
             await setDoc(newUserRef, fullNewUserData);
             await deleteDoc(doc(db, "users", oldPhone));
             loggedInUser = fullNewUserData;
        } else {
             await updateDoc(doc(db, "users", oldPhone), userUpdates);
             loggedInUser = { ...loggedInUser, ...userUpdates };
        }
        
        localStorage.setItem('aneeq_user', JSON.stringify(loggedInUser));

        await setDoc(doc(db, "shop_settings", loggedInShopId), updateData, { merge: true });
        
        // Update local cache immediately for responsiveness
        shopSettingsOverrides[loggedInShopId] = {
            ...shopSettingsOverrides[loggedInShopId],
            ...updateData
        };

        // Update in-memory SHOPS for current session
        const shopIdx = SHOPS.findIndex(s => s.id === loggedInShopId);
        if (shopIdx !== -1) {
            SHOPS[shopIdx].name = newName || SHOPS[shopIdx].name;
            if (currentStoreLogo) SHOPS[shopIdx].logo = currentStoreLogo;
            if (currentStoreHero) SHOPS[shopIdx].hero = currentStoreHero;
            SHOPS[shopIdx].phone = loggedInUser.phone;
            SHOPS[shopIdx].pass = loggedInUser.password;
        }

        showToast(currentLang === 'ar' ? 'تم تحديث الإعدادات!' : "Store settings updated!");
        currentStoreLogo = null;
        currentStoreHero = null;
        const lpc = document.getElementById('logo-preview-container');
        const hpc = document.getElementById('hero-preview-container');
        if (lpc) lpc.innerHTML = '';
        if (hpc) hpc.innerHTML = '';
        
        updateProfileUI();
    } catch (e) {
        if (e.message !== "Phone occupied") {
            handleFirestoreError(e, OperationType.WRITE, 'shop_settings');
            showToast("Error saving settings");
        }
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

async function previewProductImage(input) {
    const files = Array.from(input.files);
    
    if (files.length > 0) {
        for (const file of files) {
            if (currentBase64Images.length + imageCropQueue.length >= 5) break; 
            imageCropQueue.push(file);
        }
        
        if (imageCropQueue.length > 0 && !document.getElementById('crop-modal').classList.contains('hidden') === false) {
            processNextCrop();
        }
    }
    input.value = ''; // Reset input so same file can be selected again
}

function processNextCrop() {
    if (imageCropQueue.length === 0) return;
    
    const file = imageCropQueue.shift();
    const reader = new FileReader();
    reader.onload = function(e) {
        openCropper(e.target.result, 'product');
    };
    reader.readAsDataURL(file);
}

function renderProductPreviews() {
    const preview = document.getElementById('product-preview');
    if (!preview) return;
    preview.innerHTML = currentBase64Images.map((img, idx) => `
        <div style="position: relative; width: 80px; height: 80px;">
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">
            <button onclick="removeProductPreviewImage(${idx})" style="position: absolute; -5px; -5px; background: #ff4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">&times;</button>
            ${idx === 0 ? '<span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 8px; text-align: center; border-radius: 0 0 8px 8px;">Main</span>' : ''}
        </div>
    `).join('');
}

function removeProductPreviewImage(index) {
    currentBase64Images.splice(index, 1);
    renderProductPreviews();
}

function addTagToProduct(type) {
    const inputId = type === 'new' ? 'p-tag-input' : 'edit-p-tag-input';
    const input = document.getElementById(inputId);
    const val = input.value.trim();
    if (!val) return;
    
    if (type === 'new') {
        if (!currentProductTags.includes(val)) currentProductTags.push(val);
    } else {
        if (!currentEditProductTags.includes(val)) currentEditProductTags.push(val);
    }
    
    input.value = '';
    renderTagPills(type);
}

function removeTagFromProduct(type, index) {
    if (type === 'new') {
        currentProductTags.splice(index, 1);
    } else {
        currentEditProductTags.splice(index, 1);
    }
    renderTagPills(type);
}

function renderTagPills(type) {
    const containerId = type === 'new' ? 'p-tags-container' : 'edit-p-tags-container';
    const tags = type === 'new' ? currentProductTags : currentEditProductTags;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = tags.map((t, idx) => `
        <span class="product-tag" style="display: inline-flex; align-items: center; gap: 8px; cursor: default;">
            ${t}
            <span onclick="removeTagFromProduct('${type}', ${idx})" style="cursor: pointer; font-size: 16px; font-weight: 400; line-height: 1; border-left: 1px solid #000; padding-left: 6px; margin-left: 2px;">&times;</span>
        </span>
    `).join('');
}

async function addNewProduct() {
    if (!db) return;
    const t = TRANSLATIONS[currentLang];
    const name = document.getElementById('p-name').value;
    const cat = document.getElementById('p-cat').value;
    const price = document.getElementById('p-price').value;
    const desc = document.getElementById('p-desc').value;
    const imgs = currentBase64Images;
    
    if(!name || !price || imgs.length === 0) return alert(t.fillFields);
    
    const productData = {
        name,
        category: cat || 'General',
        price: Number(price),
        description: desc || "",
        tags: currentProductTags,
        image: imgs[0], // primary image
        images: imgs,   // full gallery
        shopId: loggedInShopId,
        createdAt: serverTimestamp()
    };
    try {
        await addDoc(collection(db, "inventory"), productData);
        document.getElementById('p-name').value = '';
        document.getElementById('p-cat').value = '';
        document.getElementById('p-price').value = '';
        document.getElementById('p-desc').value = '';
        document.getElementById('p-tag-input').value = '';
        currentProductTags = [];
        renderTagPills('new');
        document.getElementById('product-preview').innerHTML = '';
        currentBase64Images = [];
        showToast(currentLang === 'ar' ? "تمت إضافة المنتج!" : "Product Added!");
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "inventory");
    }
}

async function deleteProduct(productId) {
    const t = TRANSLATIONS[currentLang];
    if(!confirm(currentLang === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : "Are you sure you want to delete this product?")) return;
    try {
        await deleteDoc(doc(db, "inventory", productId));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `inventory/${productId}`);
    }
}

async function editProduct(productId) {
    try {
        const productSnap = await getDoc(doc(db, "inventory", productId));
        if (productSnap.exists()) {
            const p = productSnap.data();
            document.getElementById('edit-p-id').value = productId;
            document.getElementById('edit-p-name').value = p.name || '';
            document.getElementById('edit-p-cat').value = p.category || 'General';
            document.getElementById('edit-p-price').value = p.price || '';
            document.getElementById('edit-p-desc').value = p.description || '';
            currentEditProductTags = p.tags || [];
            renderTagPills('edit');
            
            document.getElementById('product-edit-modal').classList.remove('hidden');
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.GET, `inventory/${productId}`);
    }
}

function closeProductEditModal() {
    document.getElementById('product-edit-modal').classList.add('hidden');
}

async function saveProductEdit() {
    if (!db) return;
    const id = document.getElementById('edit-p-id').value;
    const name = document.getElementById('edit-p-name').value.trim();
    const cat = document.getElementById('edit-p-cat').value;
    const price = document.getElementById('edit-p-price').value;
    const desc = document.getElementById('edit-p-desc').value.trim();
    
    if(!name || !price) return alert(TRANSLATIONS[currentLang].fillFields);
    
    try {
        const updateData = {
            name,
            category: cat,
            price: Number(price),
            description: desc,
            tags: currentEditProductTags,
            updatedAt: serverTimestamp()
        };
        await updateDoc(doc(db, "inventory", id), updateData);
        closeProductEditModal();
        showToast(currentLang === 'ar' ? "تم تحديث المنتج!" : "Product Updated!");
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `inventory/${id}`);
        showToast("Error updating product");
    }
}

function zoomImage(src) {
    const modal = document.getElementById('zoom-modal');
    const img = document.getElementById('zoom-image');
    if (modal && img) {
        img.src = src;
        modal.classList.remove('hidden');
    }
}

function closeZoomModal() {
    const modal = document.getElementById('zoom-modal');
    if (modal) modal.classList.add('hidden');
}

function masterLogout() {
    isMasterLoggedIn = false;
    localStorage.removeItem('aneeq_master_session');
    document.getElementById('master-login').classList.remove('hidden');
    document.getElementById('master-dashboard').classList.add('hidden');
    document.getElementById('master-pass').value = '';
}

// BASKET & TRACKING
function handleBasketAutoTrack() {
    if (!db) return;
    const t = TRANSLATIONS[currentLang];
    const authPrompt = document.getElementById('basket-auth-prompt');
    const resultsDiv = document.getElementById('basket-results');
    const desc = document.getElementById('basket-desc');

    if (!loggedInUser) {
        authPrompt.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        desc.innerText = currentLang === 'ar' ? 'يرجى تسجيل الدخول لعرض طلبات الشراء.' : 'Please login to view your purchase requests.';
        return;
    }

    authPrompt.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    desc.innerText = currentLang === 'ar' ? 'عرض وتتبع طلبات الشراء الحالية.' : 'View and track your current purchase requests.';

    if (trackOrdersUnsubscribe) trackOrdersUnsubscribe();
    
    const phone = loggedInUser.phone;
    const listDiv = document.getElementById('customer-orders-list');
    
    const q = query(collection(db, "orders"), where("phone", "==", phone));
    trackOrdersUnsubscribe = onSnapshot(q, (snapshot) => {
        let customerOrders = [];
        snapshot.forEach(doc => customerOrders.push({ ...doc.data(), id: doc.id }));

        if(customerOrders.length === 0) {
            listDiv.innerHTML = `<p style="text-align:center; padding:40px; color:#999; background:white; border-radius:15px; border: 1px solid #eee;">${t.noOrdersFound}</p>`;
        } else {
            customerOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            listDiv.innerHTML = customerOrders.map(o => {
                const statusColor = o.status === 'Accepted' ? '#4CAF50' : (o.status === 'Refused' ? '#F44336' : '#999');
                let displayStatus = (o.status === 'pending' || !o.status) ? t.pending : o.status;
                if(o.status === 'Accepted') displayStatus = t.statusAccepted;
                if(o.status === 'Refused') displayStatus = t.statusRefused;

                return `
                    <div class="order-item" style="flex-direction: column; align-items: stretch; gap: 10px; border: 1px solid #eee; margin-bottom: 15px; border-radius: 16px; padding: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="font-size: 16px;">${o.productName}</strong><br>
                                <small style="color: #999;">${o.shopName} | ${o.time}</small>
                            </div>
                            <span style="background: ${statusColor}; color: white; padding: 6px 14px; border-radius: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${displayStatus}</span>
                        </div>
                        
                        ${o.masterMessage ? `
                            <div style="background: #fdfdfd; padding: 15px; border-radius: 12px; border-left: 4px solid ${statusColor}; margin-top: 10px;">
                                <p style="font-size: 10px; color: #999; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Aneeq Master</p>
                                <p style="color: #333; font-style: italic; line-height: 1.5; font-size: 14px;">"${o.masterMessage}"</p>
                            </div>
                        ` : `
                            <p style="font-size: 12px; color: #999; margin-top: 10px; font-style: italic;">${t.waitMaster}</p>
                        `}
                    </div>
                `;
            }).join('');
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
    });
}

function handleMasterLogin() {
    const t = TRANSLATIONS[currentLang];
    const pass = document.getElementById('master-pass').value;
    if(pass === MASTER_KEY) {
        isMasterLoggedIn = true;
        localStorage.setItem('aneeq_master_session', 'true');
        document.getElementById('master-login').classList.add('hidden');
        document.getElementById('master-dashboard').classList.remove('hidden');
        renderMasterOrders();
    } else {
        alert(t.accessDenied);
    }
}

let masterOrdersUnsubscribe = null;
function renderMasterOrders() {
    if (!db) return;
    if (masterOrdersUnsubscribe) masterOrdersUnsubscribe();
    const t = TRANSLATIONS[currentLang];
    const container = document.getElementById('master-orders-list');
    const q = query(collection(db, "orders"));
    masterOrdersUnsubscribe = onSnapshot(q, (snapshot) => {
        let orders = [];
        snapshot.forEach(doc => orders.push({ ...doc.data(), id: doc.id }));
        document.getElementById('master-stats').innerHTML = `
            <div style="display:flex; gap:20px; margin-top:20px;">
                <div>${t.totalLabel}${orders.length}</div>
                <div style="color:lawngreen">${t.systemOnline}</div>
            </div>
        `;
        orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        container.innerHTML = orders.map((o) => {
            const statusColor = o.status === 'Accepted' ? '#4CAF50' : (o.status === 'Refused' ? '#F44336' : '#999');
            let displayStatus = (o.status === 'pending' || !o.status) ? (currentLang === 'ar' ? 'قيد الانتظار' : 'Pending') : o.status;
            if(o.status === 'Accepted') displayStatus = t.statusAccepted;
            if(o.status === 'Refused') displayStatus = t.statusRefused;
            return `
            <div class="order-item" style="flex-direction: column; align-items: stretch; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size: 1.1em;">${o.productName}</strong><br>
                        <small>${o.shopName} | ${o.time}</small><br>
                        <span style="color:var(--accent); font-weight:700;">${o.price} د.ع</span><br>
                        <div style="background:rgba(0,0,0,0.03); padding: 8px; border-radius: 8px; margin-top: 10px; font-size: 13px; border-left: 3px solid var(--accent);">
                            <strong>${t.locationDetails}</strong> ${o.location}
                        </div>
                    </div>
                    <div style="text-align:right">
                        <span style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${displayStatus}</span><br>
                        <span style="color:#999; font-size:12px; display: block; margin-top: 5px;">${t.phLabel} ${o.phone}</span>
                    </div>
                </div>
                ${(o.status === 'pending' || !o.status) ? `<div style="border-top: 1px solid #eee; padding-top: 15px;">
                        <p style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #444;">${t.masterAction}</p>
                        <textarea id="msg-${o.id}" placeholder="${t.typeMessage}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 10px; font-size: 14px; min-height: 60px;"></textarea>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="updateOrderStatus('${o.id}', 'Accepted')" style="flex: 1; background: #4CAF50; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">${t.acceptRequest}</button>
                            <button onclick="updateOrderStatus('${o.id}', 'Refused')" style="flex: 1; background: #F44336; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">${t.refuseRequest}</button>
                        </div>
                    </div>` : `<div style="border-top: 1px solid #eee; padding-top: 10px; font-size: 13px;">
                        <strong>${t.messageSent}</strong> <span style="color: #666;">${o.masterMessage || 'No message provided.'}</span>
                        <button onclick="deleteOrderByID('${o.id}')" style="display: block; margin-top: 10px; background: none; border: none; color: #999; cursor: pointer; font-size: 11px; text-decoration: underline; padding: 0;">${t.removeHistory}</button>
                    </div>`}
            </div>
        `}).join('') || `<p style="color:#999; text-align:center;">${t.noItemsMarket}</p>`;
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
    });
}

// MASTER ACTIONS
function switchMasterTab(tab) {
    const ordersTab = document.getElementById('master-tab-orders');
    const shopsTab = document.getElementById('master-tab-shops');
    const ordersView = document.getElementById('master-orders-view');
    const shopsView = document.getElementById('master-shops-view');
    
    if (tab === 'orders') {
        ordersTab.style.fontWeight = '700';
        ordersTab.style.borderBottom = '2px solid #fff';
        ordersTab.style.color = '#fff';
        
        shopsTab.style.fontWeight = '400';
        shopsTab.style.borderBottom = 'none';
        shopsTab.style.color = '#999';
        
        ordersView.classList.remove('hidden');
        shopsView.classList.add('hidden');
        renderMasterOrders();
    } else {
        shopsTab.style.fontWeight = '700';
        shopsTab.style.borderBottom = '2px solid #fff';
        shopsTab.style.color = '#fff';
        
        ordersTab.style.fontWeight = '400';
        ordersTab.style.borderBottom = 'none';
        ordersTab.style.color = '#999';
        
        shopsView.classList.remove('hidden');
        ordersView.classList.add('hidden');
        renderMasterShops();
    }
}

function renderMasterShops() {
    const list = document.getElementById('master-shops-list');
    if (!list) return;

    list.innerHTML = SHOPS.map(shop => {
        const settings = shopSettingsOverrides[shop.id] || {};
        const shopName = settings.name || shop.name;
        const currentCat = settings.category || "";
        
        return `
            <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; border: 1px solid #333; padding: 20px; background: rgba(255,255,255,0.05);">
                <div>
                    <h3 style="margin: 0; font-size: 18px;">${shopName}</h3>
                    <p style="font-size: 12px; color: #999; margin-top: 5px;">ID: ${shop.id} | Phone: ${shop.phone}</p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <select id="cat-select-${shop.id}" style="background: #222; color: #fff; border: 1px solid #444; padding: 8px; border-radius: 8px; font-size: 14px;">
                        <option value="" ${!currentCat ? 'selected' : ''}>Uncategorized (Hidden)</option>
                        <option value="Men" ${currentCat === 'Men' ? 'selected' : ''}>Men</option>
                        <option value="Women" ${currentCat === 'Women' ? 'selected' : ''}>Women</option>
                        <option value="Kids" ${currentCat === 'Kids' ? 'selected' : ''}>Kids</option>
                    </select>
                    <button class="btn-primary" onclick="updateShopCategory('${shop.id}')" style="padding: 8px 15px; font-size: 12px;">Save</button>
                </div>
            </div>
        `;
    }).join('');
}

async function updateShopCategory(shopId) {
    const select = document.getElementById(`cat-select-${shopId}`);
    const newCat = select.value;
    
    try {
        await setDoc(doc(db, "shop_settings", shopId), {
            shopId: shopId,
            category: newCat,
            updatedAt: serverTimestamp()
        }, { merge: true });
        showToast("Category Updated!");
        renderMasterShops();
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `shop_settings/${shopId}`);
        showToast("Error update category");
    }
}

async function updateOrderStatus(orderId, newStatus) {
    const msgInput = document.getElementById(`msg-${orderId}`);
    const msg = msgInput ? msgInput.value : "";
    try {
        await updateDoc(doc(db, "orders", orderId), {
            status: newStatus,
            masterMessage: msg
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
}

async function deleteOrderByID(orderId) {
    try {
        await deleteDoc(doc(db, "orders", orderId));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    }
}

// Global Exports - For direct access from HTML onclick
// Assignments moved to top for availability

