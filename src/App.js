// All imports at the very top
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Star,
  Zap,
  UploadCloud,
  PlusCircle,
  Trash2,
  Eye,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import "./App.css";

// --- Environment Variables ---
const CLOUDINARY_CLOUD_NAME =
  process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "demo";
const CLOUDINARY_UPLOAD_PRESET =
  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "docs_upload_example";
const CLOUDINARY_API_KEY = "YOUR_API_KEY"; // Placeholder
const __app_id = "jerseyhub";

// --- IMPORTANT: Admin UIDs ---
const ADMIN_UID = process.env.REACT_APP_ADMIN_UID;
const ADMIN_UID2 = process.env.REACT_APP_ADMIN_UID2;

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id",
};

// Initialize Firebase
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// --- Custom Hooks ---
const useInView = (options) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window.IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }
    const observer = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        if (entry.target) {
          observer.unobserve(entry.target);
        }
      }
    }, options);
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return [ref, isInView];
};

// --- Components ---

const Header = ({ setPage, user, onSearchChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
    setPage("shop");
  };

  return (
    <header className="header">
      <div className="container header__container">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("shop");
          }}
          className="header__logo"
        >
          JERSEY<span className="header__logo--red">HUB</span>
        </a>
        <nav className={`header__nav ${isMenuOpen ? "is-open" : ""}`}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage("shop");
              setIsMenuOpen(false);
            }}
            className="header__nav-link"
          >
            Home
          </a>
          <a href="#" className="header__nav-link">
            Club Kits
          </a>
          <a href="#" className="header__nav-link">
            National
          </a>
          {user && (user.uid === ADMIN_UID || user.uid === ADMIN_UID2) ? (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("admin");
                setIsMenuOpen(false);
              }}
              className="header__nav-link admin-link"
            >
              Admin
            </a>
          ) : null}
        </nav>
        <div className="header__actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              className="search-bar__input"
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="search-bar__icon" size={20} />
          </div>
          {user ? (
            <button
              onClick={handleLogout}
              className="button button--secondary button--small"
            >
              Logout
            </button>
          ) : (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("login");
              }}
              className="header__icon-link"
            >
              <User size={24} />
            </a>
          )}
          <a href="#" className="header__icon-link cart-link">
            <ShoppingCart size={24} />
            <span className="cart-link__badge">3</span>
          </a>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="header__menu-toggle"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => (
  <section className="hero">
    <div className="hero__bg"></div>
    <div className="hero__content">
      <h1 className="hero__title">Gear Up. Stand Out. Play Loud.</h1>
      <p className="hero__subtitle">
        The official 2024/25 kits have landed. Find your team's colours and
        support them in style.
      </p>
      <a href="#products" className="button button--primary">
        Shop The Collection
      </a>
    </div>
    <div className="hero__fade"></div>
  </section>
);

// UPDATED FilterBar Component
const FilterBar = ({ sortBy, onSortChange }) => (
  <div id="products" className="filter-bar">
    <div className="container filter-bar__container">
      <div className="filter-bar__group">
        <span className="filter-bar__label">Filter by:</span>
        <button className="filter-bar__button">All</button>
        <button className="filter-bar__button">
          <Zap size={14} /> New
        </button>
        <button className="filter-bar__button">On Sale</button>
      </div>
      <div className="filter-bar__group">
        <span className="filter-bar__label">Sort by:</span>
        <div className="filter-bar__select-wrapper">
          <select
            className="filter-bar__select"
            value={sortBy} // Controlled by state
            onChange={(e) => onSortChange(e.target.value)} // Calls the function on change
          >
            <option value="popularity">Popularity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
          <ChevronDown size={16} className="filter-bar__select-icon" />
        </div>
      </div>
    </div>
  </div>
);


const ProductCard = ({ jersey, onProductClick }) => {
  const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const getTagClass = (tag) => {
    if (!tag) return "";
    const lowerCaseTag = tag.toLowerCase();
    if (lowerCaseTag.includes("sale")) return "product-card__tag--sale";
    if (lowerCaseTag.includes("limited")) return "product-card__tag--limited";
    return "product-card__tag--new";
  };
  return (
    <div
      ref={ref}
      className={`product-card ${isInView ? "is-visible" : ""}`}
      onClick={() => onProductClick(jersey)}
    >
      {jersey.tag && (
        <div className={`product-card__tag ${getTagClass(jersey.tag)}`}>
          {jersey.tag}
        </div>
      )}
      <div className="product-card__image-wrapper">
        <img
          src={jersey.imageUrl}
          alt={
            jersey.alt || `${jersey.team} - ${jersey.name}` || "Jersey Image"
          }
          className="product-card__image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found";
          }}
        />
      </div>
      <div className="product-card__info">
        <p className="product-card__team">{jersey.team}</p>
        <h3 className="product-card__name">{jersey.name}</h3>
        <div className="product-card__footer">
          <p className="product-card__price">
            ₹{Number(jersey.price).toLocaleString("en-IN")}
          </p>
          <div className="product-card__rating">
            <Star size={18} fill="currentColor" />
            <span>{jersey.rating}</span>
          </div>
        </div>
      </div>
      <div className="product-card__overlay">
        <div className="product-card__overlay-buttons">
          <button className="button button--secondary">Add to Cart</button>
          <button className="button button--secondary">Quick View</button>
        </div>
      </div>
    </div>
  );
};

// ... other components (ProductDetail, Footer, AdminPortal, LoginPage) remain the same ...
// I am omitting them here for brevity, but you should keep them in your file.
const ProductDetail = ({ product, onBack }) => (
  <section className="product-detail-page">
    <div className="container">
      <div className="back-button-container">
        <button onClick={onBack} className="button button--secondary">
          <ArrowLeft size={20} /> Back to Shop
        </button>
      </div>
      <div className="product-detail-grid">
        <div className="product-detail-image-container">
          <img
            src={product.imageUrl}
            alt={product.alt}
            className="product-detail-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/800x800/cccccc/ffffff?text=Image+Not+Found";
            }}
          />
        </div>
        <div className="product-detail-info">
          <p className="product-detail-team">{product.team}</p>
          <h1 className="product-detail-name">{product.name}</h1>
          <div className="product-detail-rating">
            <Star size={24} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
          <p className="product-detail-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>
          <div className="product-detail-actions">
            <button className="button button--primary">Add to Cart</button>
            <button className="button button--secondary">Buy Now</button>
          </div>
          <div className="product-detail-specs">
            <p>
              <strong>Brand:</strong> {product.brand}
            </p>
            <p>
              <strong>Tag:</strong> {product.tag}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <div className="container footer__container">
      <div className="footer__grid">
        <div className="footer__about">
          <h3 className="footer__logo">
            JERSEY<span className="footer__logo--red">HUB</span>
          </h3>
          <p>
            The ultimate destination for authentic football kits. Wear your
            passion with pride.
          </p>
        </div>
        <div className="footer__links">
          <h4 className="footer__heading">Shop</h4>
          <a href="#">New Arrivals</a>
          <a href="#">Club Kits</a>
          <a href="#">National Teams</a>
          <a href="#">On Sale</a>
        </div>
        <div className="footer__links">
          <h4 className="footer__heading">Support</h4>
          <a href="#">Contact Us</a>
          <a href="#">FAQ</a>
          <a href="#">Shipping & Returns</a>
          <a href="#">Track Order</a>
        </div>
        <div className="footer__subscribe">
          <h4 className="footer__heading">Stay Connected</h4>
          <p>Subscribe for the latest drops, deals, and more.</p>
          <form className="footer__form">
            <input type="email" placeholder="Your Email" />
            <button type="submit">Go</button>
          </form>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} JerseyHub. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

const AdminPortal = () => {
  const [product, setProduct] = useState({ name: "", team: "", price: "", rating: "", brand: "", tag: "", alt: "" });
  const [products, setProducts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (!db) { console.error("Firestore DB is not initialized."); return; }
    const firestorePath = `artifacts/${__app_id}/public/data/products`;
    const productsCollectionRef = collection(db, firestorePath);
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productsData = [];
      snapshot.forEach((doc) => { productsData.push({ id: doc.id, ...doc.data() }); });
      setProducts(productsData);
    }, (error) => { console.error("Error fetching products:", error); setProducts([]); });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => { if (e.target.files[0]) { setImageFile(e.target.files[0]); } };
  const handleDeleteClick = (product) => { setProductToDelete(product); setIsModalOpen(true); };
  const handleCancelDelete = () => { setIsModalOpen(false); setProductToDelete(null); };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsLoading(true);
    setMessage(`Deleting ${productToDelete.name}...`);
    setIsModalOpen(false);
    try {
      const publicIdMatch = productToDelete.imageUrl.match(/\/v\d+\/(.*?)(\.[a-z]+)?$/);
      const publicId = publicIdMatch ? publicIdMatch[1] : null;
      if (!publicId) { throw new Error("Could not extract public ID from image URL."); }
      const cloudinaryResponse = await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        throw new Error(errorData.error || "Failed to delete image from Cloudinary via server.");
      }
      const docRef = doc(db, `artifacts/${__app_id}/public/data/products`, productToDelete.id);
      await deleteDoc(docRef);
      setMessage("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product: ", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setProductToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!imageFile || !product.name || !product.price || !product.team || !product.alt) {
      setMessage("Please fill all required fields and upload an image.");
      return;
    }
    setIsLoading(true);
    setMessage("Uploading image to Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || "Image upload failed.");
      }
      const data = await response.json();
      const imageUrl = data.secure_url;
      setMessage("Image uploaded! Saving product to database...");
      const productData = { ...product, price: parseFloat(product.price), rating: parseFloat(product.rating) || 0, imageUrl: imageUrl, createdAt: new Date() };
      const firestorePath = `artifacts/${__app_id}/public/data/products`;
      await addDoc(collection(db, firestorePath), productData);
      setMessage("Product added successfully!");
      setProduct({ name: "", team: "", price: "", rating: "", brand: "", tag: "", alt: "" });
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error adding product: ", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-portal">
      <div className="container">
        <section>
          <h2 className="section-title">Admin Portal</h2>
          <p className="section-subtitle">Add a new jersey to the store.</p>
          <form onSubmit={handleSubmit} className="admin-form" autoComplete="off">
            <div className="form-grid">
              <input type="text" name="name" placeholder="Jersey Name" value={product.name} onChange={handleInputChange} required autoComplete="off" />
              <input type="text" name="team" placeholder="Team" value={product.team} onChange={handleInputChange} required autoComplete="off" />
              <input type="number" name="price" placeholder="Price" value={product.price} onChange={handleInputChange} required autoComplete="off" />
              <input type="number" step="0.1" name="rating" placeholder="Rating (e.g., 4.5)" value={product.rating} onChange={handleInputChange} autoComplete="off" />
              <input type="text" name="brand" placeholder="Brand (e.g., Adidas)" value={product.brand} onChange={handleInputChange} autoComplete="off" />
              <input type="text" name="tag" placeholder="Tag (e.g., New Arrival)" value={product.tag} onChange={handleInputChange} autoComplete="off" />
              <input type="text" name="alt" placeholder="Image Alt Text" value={product.alt} onChange={handleInputChange} required autoComplete="off" />
            </div>
            <div className="file-upload-wrapper">
              <label htmlFor="file-upload" className="file-upload-label">
                <UploadCloud size={24} />
                <span>{imageFile ? imageFile.name : "Upload Jersey Image"}</span>
              </label>
              <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" required ref={fileInputRef} className="hidden" />
            </div>
            <button type="submit" className="button button--primary admin-submit-button" disabled={isLoading}>
              {isLoading ? "Uploading..." : <><PlusCircle size={20} /> Add Product</>}
            </button>
            {message && <p className={`form-message ${message.startsWith("Error") ? "form-message--error" : ""}`}>{message}</p>}
          </form>
        </section>
        <section className="admin-product-list-section">
          <h2 className="section-title">Current Products</h2>
          {products.length === 0 && !isLoading && <p className="admin-message">No products found. Add a new one above!</p>}
          {products.length > 0 && (
            <div className="admin-product-grid">
              {products.map((p) => (
                <div key={p.id} className="admin-product-card">
                  <img src={p.imageUrl} alt={p.alt} className="admin-product-image" />
                  <div className="admin-product-info">
                    <p className="admin-product-name">{p.name} - {p.team}</p>
                    <p className="admin-product-price">₹{Number(p.price).toFixed(2)}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button className="admin-action-button" title="View Product"><Eye size={20} /></button>
                    <button onClick={() => handleDeleteClick(p)} className="admin-action-button admin-action-button--delete" title="Delete Product" disabled={isLoading}><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <button onClick={handleCancelDelete} className="modal-close-button"><XCircle size={24} /></button>
            </div>
            <div className="modal-body">
              <p className="modal-title">Confirm Deletion</p>
              <p className="modal-message">
                Are you sure you want to delete <span className="font-semibold">{productToDelete?.name}</span>? This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button onClick={handleDeleteConfirm} className="button button--primary button--delete" disabled={isLoading}>Yes, Delete</button>
                <button onClick={handleCancelDelete} className="button button--secondary" disabled={isLoading}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LoginPage = ({ setPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!auth) { setError("Firebase not initialized. Please check your configuration."); return; }
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPage("shop");
    } catch (err) {
      setError("Failed to log in. Please check your email and password.");
      console.error("Login error:", err);
    }
    setIsLoading(false);
  };

  return (
    <section className="login-page">
      <div className="container">
        <h2 className="section-title">Admin Login</h2>
        <form onSubmit={handleLogin} className="login-form" autoComplete="off">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />
          <button type="submit" className="button button--primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="form-message form-message--error">{error}</p>}
        </form>
      </div>
    </section>
  );
};


// --- Main App Component ---

export default function App() {
  const [page, setPage] = useState("shop");
  const [jerseys, setJerseys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // NEW STATE FOR SORTING
  const [sortBy, setSortBy] = useState("popularity");

  // Authentication state listener
  useEffect(() => {
    if (!auth) return;
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && page === "admin") {
        setPage("shop");
      }
    });
    return () => authUnsubscribe();
  }, [page]);

  // Firestore data listener for shop page
  useEffect(() => {
    if (!db) {
      console.error("Firestore DB is not initialized.");
      setIsLoading(false);
      return;
    }
    const collectionName = "products";
    const firestorePath = `artifacts/${__app_id}/public/data/${collectionName}`;
    const q = collection(db, firestorePath);
    const dataUnsubscribe = onSnapshot(q, (querySnapshot) => {
      const jerseysData = [];
      querySnapshot.forEach((doc) => {
        jerseysData.push({ id: doc.id, ...doc.data() });
      });
      setJerseys(jerseysData);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore snapshot error: ", error);
      setIsLoading(false);
    });
    return () => dataUnsubscribe();
  }, []);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setSelectedProduct(null);
  };
  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };
  const handleBackToShop = () => {
    setSelectedProduct(null);
  };

  const filteredJerseys = jerseys.filter(
    (jersey) =>
      jersey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jersey.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // NEW SORTING LOGIC
  const sortedAndFilteredJerseys = useMemo(() => {
    const sortableJerseys = [...filteredJerseys];

    switch (sortBy) {
      case 'price-asc':
        return sortableJerseys.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sortableJerseys.sort((a, b) => b.price - a.price);
      case 'rating':
        return sortableJerseys.sort((a, b) => b.rating - a.rating);
      case 'popularity':
      default:
        return sortableJerseys.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA;
        });
    }
  }, [filteredJerseys, sortBy]);


  const renderPage = () => {
    switch (page) {
      case "admin":
        return user && (user.uid === ADMIN_UID || user.uid === ADMIN_UID2) ? (
          <AdminPortal />
        ) : (
          <LoginPage setPage={setPage} />
        );
      case "login":
        return <LoginPage setPage={setPage} />;
      case "shop":
      default:
        if (selectedProduct) {
          return (
            <ProductDetail
              product={selectedProduct}
              onBack={handleBackToShop}
            />
          );
        }

        // UPDATED RENDER LOGIC FOR SHOP
        return (
          <>
            {searchQuery === "" && <HeroSection />}
            {searchQuery === "" && (
              <FilterBar sortBy={sortBy} onSortChange={setSortBy} />
            )}
            <section className="product-section">
              <div className="container">
                {isLoading ? (
                  <p style={{ textAlign: "center", padding: "4rem", fontSize: "1.2rem" }}>
                    Loading Products...
                  </p>
                ) : sortedAndFilteredJerseys.length > 0 ? (
                  <div className="product-grid">
                    {sortedAndFilteredJerseys.map((jersey) => (
                      <ProductCard
                        key={jersey.id}
                        jersey={jersey}
                        onProductClick={handleProductClick}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: "center", padding: "4rem", fontSize: "1.2rem" }}>
                    No products found matching your search.
                  </p>
                )}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="app">
      <Header
        setPage={setPage}
        user={user}
        onSearchChange={handleSearchChange}
      />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
}