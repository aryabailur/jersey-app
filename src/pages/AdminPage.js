import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UploadCloud, PlusCircle, Trash2, Eye, XCircle } from 'lucide-react';

// Make sure you have these in your main .env file for the frontend
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const __app_id = "jerseyhub";

export default function AdminPage() {
  const [product, setProduct] = useState({ name: "", team: "", price: "", rating: "", brand: "", tag: "", alt: "" });
  const [products, setProducts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const firestorePath = `artifacts/${__app_id}/public/data/products`;
    const productsCollectionRef = collection(db, firestorePath);
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

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
    setIsModalOpen(false);
    try {
      const publicIdMatch = productToDelete.imageUrl.match(/\/v\d+\/(.*?)(\.[a-z]+)?$/);
      const publicId = publicIdMatch ? publicIdMatch[1] : null;

      if (publicId) {
        // THIS IS THE CORRECTED LINE 👇
        await fetch("http://localhost:3001/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId }),
        });
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
    if (!imageFile || !product.name || !product.team || !product.alt) {
      setMessage("Please fill all required fields and upload an image.");
      return;
    }
    setIsLoading(true);
    setMessage("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Image upload failed.");
      
      const data = await response.json();
      setMessage("Image uploaded! Saving product...");

      const productData = {
        ...product,
        price: parseFloat(product.price),
        rating: parseFloat(product.rating) || 0,
        imageUrl: data.secure_url,
        createdAt: new Date(),
      };

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
              <input type="text" name="name" placeholder="Jersey Name" value={product.name} onChange={handleInputChange} required />
              <input type="text" name="team" placeholder="Team" value={product.team} onChange={handleInputChange} required />
              <input type="number" name="price" placeholder="Price" value={product.price} onChange={handleInputChange} required />
              <input type="number" step="0.1" name="rating" placeholder="Rating (e.g., 4.5)" value={product.rating} onChange={handleInputChange} />
              <input type="text" name="brand" placeholder="Brand (e.g., Adidas)" value={product.brand} onChange={handleInputChange} />
              <input type="text" name="tag" placeholder="Tag (e.g., New Arrival)" value={product.tag} onChange={handleInputChange} />
              <input type="text" name="alt" placeholder="Image Alt Text" value={product.alt} onChange={handleInputChange} required />
            </div>
            <div className="file-upload-wrapper">
              <label htmlFor="file-upload" className="file-upload-label">
                <UploadCloud size={24} />
                <span>{imageFile ? imageFile.name : "Upload Jersey Image"}</span>
              </label>
              <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" required ref={fileInputRef} style={{ display: 'none' }} />
            </div>
            <button type="submit" className="button button--primary admin-submit-button" disabled={isLoading}>
              {isLoading ? "Processing..." : <><PlusCircle size={20} /> Add Product</>}
            </button>
            {message && <p className={`form-message ${message.startsWith("Error") ? "form-message--error" : ""}`}>{message}</p>}
          </form>
        </section>

        <section className="admin-product-list-section">
          <h2 className="section-title">Current Products</h2>
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
            {/* ... modal JSX ... */}
        </div>
      )}
    </div>
  );
}