"use client";

import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useSession } from 'next-auth/react';
import ProductNavWrapper from './ProductNavWrapper';
import ProductTable from '@/components/ProductTable';
import AddProductModal from '@/components/AddProductModal';
import React, { useState } from 'react';
import { Product } from '@/types/Product';

export default function Products() {
  const { status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  React.useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productToDelete: Product) => {
    // Validate product ID
    if (!productToDelete.id) {
      console.error('Cannot delete product: No ID provided');
      alert('Cannot delete product: Invalid product');
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(`Are you sure you want to delete the product: ${productToDelete.name}?`);
    if (!confirmDelete) {
      return;
    }

    try {
      console.log('Attempting to delete product:', productToDelete);
      
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);

      const responseData = await response.json();
      console.log('Full response data:', responseData);

      if (!response.ok) {
        console.error('Delete response error:', responseData);
        
        // Attempt to extract the most meaningful error message
        let errorMessage = 'Failed to delete product';
        
        // Try different ways to extract an error message
        if (typeof responseData.details === 'string') {
          errorMessage = responseData.details;
        } else if (responseData.details && responseData.details.error) {
          errorMessage = responseData.details.error;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }

        // Log additional context
        console.log('Error details:', JSON.stringify(responseData, null, 2));

        throw new Error(errorMessage);
      }

      // Update the products list by filtering out the deleted product
      const updatedProducts = products.filter(p => p.id !== productToDelete.id);
      console.log('Updated products list:', updatedProducts);
      setProducts(updatedProducts);

      // Optional: Show success message
      alert(`Product "${productToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting product:', error);
      
      // Detailed error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to delete product: ${errorMessage}`);

      // Optionally, force a refresh of products to reconcile any discrepancies
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (refreshError) {
        console.error('Error refreshing products:', refreshError);
      }
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <span className="text-gray-600">Loading products...</span>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <ProductNavWrapper>
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Product Management</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add New Product
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="text-gray-600">Loading products...</span>
          </div>
        ) : (
          <ProductTable
            products={products}
            onEditProduct={(product) => {
              setProductToEdit(product);
              setModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
        {modalOpen && (
          <AddProductModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setProductToEdit(null);
            }}
            onSave={(product) => {
              if (productToEdit) {
                // Update existing product
                const updatedProducts = products.map(p => 
                  p.id === product.id ? product : p
                );
                setProducts(updatedProducts);
              } else {
                // Add new product
                setProducts([...products, product]);
              }
              setModalOpen(false);
              setProductToEdit(null);
            }}
            productToEdit={productToEdit}
          />
        )}
      </div>
    </ProductNavWrapper>
  );
}
