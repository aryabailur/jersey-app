import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config"; // ✅ FIXED: Corrected path
import "../App.css"; // ✅ FIXED: Corrected path
import { UploadCloud, PlusCircle, Trash2, Eye, XCircle } from "lucide-react";

// Environment variables for Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const __app_id = "jerseyhub"; // Your App ID for Firebase

export default function AdminPage() {
  // State for the form fields
  const [product, setProduct] = useState({
    name: "",
    team: "",
    price: "",
    rating: "",
    brand: "",
    tag: "",
    alt: "",
  });
  // State to hold the list of all products from Firebase
  const [products, setProducts] = useState([]);
  // State for the selected image file
  const [imageFile, setImageFile] = useState(null);
  // State to handle loading states for buttons
  const [isLoading, setIsLoading] = useState(false);
  // State to show success or error messages to the user
  const [message, setMessage] = useState("");
  // Ref to clear the file input after submission
  const fileInputRef = useRef(null);
  // State for the delete confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // useEffect to fetch products from Firebase in real-time
  useEffect(() => {
    const firestorePath = `artifacts/${__app_id}/public/data/products`;
    const productsCollectionRef = collection(db, firestorePath);
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    });
    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Handlers for form inputs and file selection
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Handlers for the delete confirmation modal
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsModalOpen(true);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setProductToDelete(null);
  };

  // Main logic to delete a product
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsLoading(true);
    setMessage(`Deleting ${productToDelete.name}...`);
    setIsModalOpen(false);
    try {
      // IMPORTANT: This part requires a running backend server on localhost:3001
      // to securely delete the image from Cloudinary.
      const publicIdMatch = productToDelete.imageUrl.match(
        /\/v\d+\/(.*?)(\.[a-z]+)?$/
      );
      const publicId = publicIdMatch ? publicIdMatch[1] : null;

      if (publicId) {
        await fetch("http://localhost:3001/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId }),
        });
      }

      // Delete the product document from Firebase
      const docRef = doc(
        db,
        `artifacts/${__app_id}/public/data/products`,
        productToDelete.id
      );
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

  // Main logic to add a new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !product.name || !product.team || !product.alt) {
      setMessage("Please fill all required fields and upload an image.");
      return;
    }
    setIsLoading(true);
    setMessage("Uploading image...");
    try {
      // 1. Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!response.ok) throw new Error("Image upload failed.");

      const data = await response.json();
      setMessage("Image uploaded! Saving product...");

      // 2. Prepare product data to save in Firebase
      const productData = {
        ...product,
        price: parseFloat(product.price),
        rating: parseFloat(product.rating) || 0,
        imageUrl: data.secure_url,
        createdAt: new Date(),
      };

      // 3. Save product data to Firebase
      const firestorePath = `artifacts/${__app_id}/public/data/products`;
      await addDoc(collection(db, firestorePath), productData);

      // 4. Reset form and show success message
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

  return (
    <div className="admin-portal">
      <div className="container">
        <section>
          <h2 className="section-title">Admin Portal</h2>
          <p className="section-subtitle">Add a new jersey to the store.</p>
          <form
            onSubmit={handleSubmit}
            className="admin-form"
            autoComplete="off"
          >
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
                <UploadCloud size={24} />
                <span>
                  {imageFile ? imageFile.name : "Upload Jersey Image"}
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                required
                ref={fileInputRef}
                style={{ display: "none" }}
              />
            </div>
            <button
              type="submit"
              className="button button--primary admin-submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <PlusCircle size={20} /> Add Product
                </>
              )}
            </button>
            {message && (
              <p
                className={`form-message ${
                  message.startsWith("Error") ? "form-message--error" : ""
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </section>

        <section className="admin-product-list-section">
          <h2 className="section-title">Current Products</h2>
          {products.length === 0 && !isLoading ? (
            <p className="admin-message">No products found. Add one above!</p>
          ) : (
            <div className="admin-product-grid">
              {products.map((p) => (
                <div key={p.id} className="admin-product-card">
                  <img
                    src={p.imageUrl}
                    alt={p.alt}
                    className="admin-product-image"
                  />
                  <div className="admin-product-info">
                    <p className="admin-product-name">
                      {p.name} - {p.team}
                    </p>
                    <p className="admin-product-price">
                      ₹{Number(p.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="admin-product-actions">
                    <button
                      className="admin-action-button"
                      title="View Product"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(p)}
                      className="admin-action-button admin-action-button--delete"
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <button
                onClick={handleCancelDelete}
                className="modal-close-button"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-title">Confirm Deletion</p>
              <p className="modal-message">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{productToDelete?.name}</span>?
                This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  onClick={handleDeleteConfirm}
                  className="button button--primary button--delete"
                  disabled={isLoading}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="button button--secondary"
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
}
