import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, deleteDoc, onSnapshot, collection, query, addDoc } from 'firebase/firestore';
import { PlusCircle, UploadCloud, Trash2, Eye, XCircle } from 'lucide-react'; // Added Trash2 and Eye icons for UI

// ==============================================
// 📦 Firebase & Environment Setup
// ==============================================
// The `__app_id`, `__firebase_config`, and `__initial_auth_token`
// are global variables provided by the canvas environment.
// We initialize Firebase and handle authentication here.

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Cloudinary configuration (replace with your actual values)
// IMPORTANT: For security, a real application should proxy these through a backend server.
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";
const CLOUDINARY_API_KEY = "YOUR_API_KEY"; // Needed for deletion, but should be kept on the server

const AdminPortal = () => {
  // ==============================================
  // 📦 State Management
  // ==============================================
  const [product, setProduct] = useState({
    name: "",
    team: "",
    price: "",
    rating: "",
    brand: "",
    tag: "",
    alt: "",
  });
  const [products, setProducts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const fileInputRef = useRef(null);

  // State for the delete confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // ==============================================
  // 🔐 Authentication & Data Fetching
  // ==============================================
  useEffect(() => {
    const signIn = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase authentication error:", error);
      }
    };
    signIn();

    // Set up a listener for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(!!user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Only set up Firestore listener if Firebase is authenticated and ready
    if (!isAuthReady) return;

    const firestorePath = `artifacts/${appId}/public/data/products`;
    const productsCollectionRef = collection(db, firestorePath);

    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productsData = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    }, (error) => {
      console.error("Error fetching products:", error);
      // It's good practice to handle the error, perhaps by clearing the list or showing a message
      setProducts([]);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [isAuthReady]);

  // ==============================================
  // ✍️ Event Handlers
  // ==============================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsModalOpen(true);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsLoading(true);
    setMessage(`Deleting ${productToDelete.name}...`);
    setIsModalOpen(false); // Close the modal immediately

    try {
      // Step 1: Extract the public_id from the Cloudinary image URL
      // The public_id is typically the part of the URL after /upload/ and before the file extension.
      // E.g., from '.../v1612345678/my-folder/my-image.jpg', the public_id is 'my-folder/my-image'.
      const urlParts = productToDelete.imageUrl.split('/');
      const publicIdWithExt = urlParts.pop(); // 'my-image.jpg'
      const version = urlParts.pop(); // 'v1612345678'
      const folderPath = urlParts.slice(urlParts.indexOf('upload') + 1).join('/'); // 'my-folder'
      const publicId = folderPath ? `${folderPath}/${publicIdWithExt.split('.')[0]}` : publicIdWithExt.split('.')[0];
      
      console.log("Extracted public ID for Cloudinary deletion:", publicId);

      // Step 2: Delete from Cloudinary (requires a server-side call)
      // The direct client-side deletion is insecure because it requires an API secret.
      // In a real app, you would have a backend endpoint like:
      // await fetch('/api/delete-image', {
      //   method: 'POST',
      //   body: JSON.stringify({ publicId })
      // });
      // For this example, we will just log a message.
      setMessage("Product deleted from Firestore. Image deletion from Cloudinary would happen here via a secure backend call.");
      console.warn("Cloudinary deletion requires a secure backend endpoint. The image has NOT been deleted from Cloudinary in this demo.");

      // Step 3: Delete from Firestore
      const docRef = doc(db, `artifacts/${appId}/public/data/products`, productToDelete.id);
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
    if (isLoading || !isAuthReady) return;
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

      const firestorePath = `artifacts/${appId}/public/data/products`;
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error adding product: ", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================================
  // 💻 Component UI
  // ==============================================
  return (
    <div className="bg-gray-100 p-8 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Admin Portal</h2>
          <p className="text-center text-gray-600 mb-6">Add a new jersey to the store.</p>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Jersey Name"
                value={product.name}
                onChange={handleInputChange}
                required
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
              <input
                type="text"
                name="team"
                placeholder="Team"
                value={product.team}
                onChange={handleInputChange}
                required
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={product.price}
                onChange={handleInputChange}
                required
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
              <input
                type="number"
                step="0.1"
                name="rating"
                placeholder="Rating (e.g., 4.5)"
                value={product.rating}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
              <input
                type="text"
                name="brand"
                placeholder="Brand (e.g., Adidas)"
                value={product.brand}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
              <input
                type="text"
                name="tag"
                placeholder="Tag (e.g., New Arrival)"
                value={product.tag}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
              <input
                type="text"
                name="alt"
                placeholder="Image Alt Text"
                value={product.alt}
                onChange={handleInputChange}
                required
                className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoComplete="off"
              />
            </div>
            <div className="file-upload-wrapper w-full">
              <label htmlFor="file-upload" className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors text-gray-500">
                <UploadCloud size={24} className="mr-2" />
                <span>{imageFile ? imageFile.name : "Upload Jersey Image"}</span>
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                required
                ref={fileInputRef}
                className="hidden"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center p-3 rounded-md bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isLoading || !isAuthReady}
            >
              {isLoading ? (
                "Uploading..."
              ) : (
                <>
                  <PlusCircle size={20} className="mr-2" /> Add Product
                </>
              )}
            </button>
            {message && <p className={`mt-4 text-center ${message.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">Current Products</h2>
          {isAuthReady && products.length === 0 && !isLoading && (
            <p className="text-center text-gray-500">No products found. Add a new one above!</p>
          )}
          {isAuthReady && products.length > 0 && (
            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <img src={p.imageUrl} alt={p.alt} className="w-16 h-16 object-cover rounded-md mr-4 border border-gray-300" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{p.name} - {p.team}</p>
                    <p className="text-sm text-gray-600">${p.price.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-full text-blue-500 hover:bg-blue-100 transition-colors"
                      title="View Product"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(p)}
                      className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                      title="Delete Product"
                      disabled={isLoading}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full mx-4">
            <div className="flex justify-end">
              <button onClick={handleCancelDelete} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</p>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{productToDelete?.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors"
                  disabled={isLoading}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
