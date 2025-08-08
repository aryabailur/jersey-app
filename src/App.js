// All imports at the very top
import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import "./App.css";

// --- Step 1: Add your Cloudinary and Firebase credentials ---
const CLOUDINARY_CLOUD_NAME = "dnksifaqz";
const CLOUDINARY_UPLOAD_PRESET = "jersey_uploads";
const __app_id = "jerseyhub";

// --- IMPORTANT: PASTE YOUR ADMIN'S FIREBASE UID HERE ---
const ADMIN_UID = "12GZHlsUgddAqP2pea2Uonzo5R02";
const ADMIN_UID2 = "fQ6eFDWTBcZjzjGwfJcX1rZEcBG2";

const firebaseConfig = {
  apiKey: "AIzaSyDu4WCEVqMa4H_lj0sOg3Xe1QIuUxKB3XQ",
  authDomain: "jersey-app-70680.firebaseapp.com",
  projectId: "jersey-app-70680",
  storageBucket: "jersey-app-70680.appspot.com",
  messagingSenderId: "616174087940",
  appId: "1:616174087940:web:29c71244024faf509caa51",
  measurementId: "G-8816R07BQH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Components ---

const useInView = (options) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
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

const Header = ({ setPage, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut(auth);
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
      <h1 className="hero__title">Wear Your Allegiance</h1>
      <p className="hero__subtitle">
        The official 2024/25 kits have landed. Find your team's colours and
        support them in style.
      </p>
      <a href="#" className="button button--primary">
        Shop The Collection
      </a>
    </div>
  </section>
);

const FilterBar = () => (
  <div className="filter-bar">
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
          <select className="filter-bar__select">
            <option>Popularity</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating</option>
          </select>
          <ChevronDown size={16} className="filter-bar__select-icon" />
        </div>
      </div>
    </div>
  </div>
);

const ProductCard = ({ jersey }) => {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  const getTagClass = (tag) => {
    if (tag === "Sale") return "product-card__tag--sale";
    if (tag === "Limited Edition") return "product-card__tag--limited";
    return "product-card__tag--new";
  };
  return (
    <div ref={ref} className={`product-card ${isInView ? "is-visible" : ""}`}>
      {jersey.tag && (
        <div className={`product-card__tag ${getTagClass(jersey.tag)}`}>
          {jersey.tag}
        </div>
      )}
      <div className="product-card__image-wrapper">
        <img
          src={jersey.imageUrl}
          alt={jersey.alt || `${jersey.team} - ${jersey.name}`}
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
  const [product, setProduct] = useState({
    name: "",
    team: "",
    price: "",
    rating: "",
    brand: "",
    tag: "",
    alt: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !product.name || !product.price) {
      setMessage("Please fill all required fields and upload an image.");
      return;
    }
    setIsLoading(true);
    setMessage("Uploading image to Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || "Image upload failed.");
      }
      const data = await response.json();
      const imageUrl = data.secure_url;
      setMessage("Image uploaded! Saving product to database...");
      const productData = {
        ...product,
        price: parseFloat(product.price),
        rating: parseFloat(product.rating) || 0,
        imageUrl: imageUrl,
        createdAt: new Date(),
      };
      const firestorePath = `artifacts/${__app_id}/public/data/products`;
      await addDoc(collection(db, firestorePath), productData);
      setMessage("Product added successfully!");
      setProduct({
        name: "",
        team: "",
        price: "",
        rating: "",
        brand: "",
        tag: "",
        alt: "",
      });
      setImageFile(null);
      e.target.reset();
    } catch (error) {
      console.error("Error adding product: ", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section className="admin-portal">
      <div className="container">
        <h2 className="section-title">Admin Portal</h2>
        <p className="section-subtitle">Add a new jersey to the store.</p>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <input
              type="text"
              name="name"
              placeholder="Jersey Name"
              value={product.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="team"
              placeholder="Team"
              value={product.team}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={product.price}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              step="0.1"
              name="rating"
              placeholder="Rating (e.g., 4.5)"
              value={product.rating}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="brand"
              placeholder="Brand (e.g., Adidas)"
              value={product.brand}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="tag"
              placeholder="Tag (e.g., New Arrival)"
              value={product.tag}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="alt"
              placeholder="Image Alt Text"
              value={product.alt}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="file-upload-wrapper">
            <label htmlFor="file-upload" className="file-upload-label">
              <UploadCloud />
              <span>{imageFile ? imageFile.name : "Upload Jersey Image"}</span>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
          </div>
          <button
            type="submit"
            className="button button--primary"
            disabled={isLoading}
          >
            {isLoading ? (
              "Uploading..."
            ) : (
              <>
                <PlusCircle size={20} /> Add Product
              </>
            )}
          </button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </div>
    </section>
  );
};

const LoginPage = ({ setPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPage("shop"); // Redirect to shop on successful login
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
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="button button--primary"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="form-message form-message--error">{error}</p>}
        </form>
      </div>
    </section>
  );
};

export default function App() {
  const [page, setPage] = useState("shop");
  const [jerseys, setJerseys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the full user object
      if (!currentUser) {
        // If logged out, ensure we are not on the admin page
        if (page === "admin") {
          setPage("shop");
        }
      }
    });
    return () => authUnsubscribe();
  }, [page]);

  useEffect(() => {
    setIsLoading(true);
    const collectionName = "products";
    const firestorePath = `artifacts/${__app_id}/public/data/${collectionName}`;
    const q = collection(db, firestorePath);

    const dataUnsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const jerseysData = [];
        querySnapshot.forEach((doc) => {
          jerseysData.push({ id: doc.id, ...doc.data() });
        });
        setJerseys(jerseysData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore snapshot error: ", error);
        setIsLoading(false);
      }
    );
    return () => dataUnsubscribe();
  }, []);

  const renderPage = () => {
    switch (page) {
      case "admin":
        // Only render AdminPortal if the logged-in user is the admin
        return user && user.uid === ADMIN_UID ? (
          <AdminPortal />
        ) : (
          <LoginPage setPage={setPage} />
        );
      case "login":
        return <LoginPage setPage={setPage} />;
      case "shop":
      default:
        return (
          <>
            <HeroSection />
            <FilterBar />
            <section className="product-section">
              <div className="container">
                {isLoading ? (
                  <p style={{ textAlign: "center", padding: "2rem" }}>
                    Loading Products...
                  </p>
                ) : jerseys.length > 0 ? (
                  <div className="product-grid">
                    {jerseys.map((jersey) => (
                      <ProductCard key={jersey.id} jersey={jersey} />
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: "center", padding: "2rem" }}>
                    No products found. Add some in the Admin page!
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
      <Header setPage={setPage} user={user} />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
}
