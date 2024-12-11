import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "./CartContext";
import { jsPDF } from "jspdf"; // Import jsPDF

const CartPage = () => {
  const { cart, dispatch } = useContext(CartContext);
  const [productHistory, setProductHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false); // State for order confirmation

  // Calculate Total Price
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Calculate Tax (5%)
  const calculateTax = () => {
    return calculateTotal() * 0.05;
  };

  // Grand Total
  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax();
  };

  // Update Product History Automatically when cart changes
  useEffect(() => {
    setProductHistory((prevHistory) => {
      // Filter products that are still in the cart
      const updatedHistory = prevHistory.filter((historyItem) =>
        cart.some((cartItem) => cartItem.id === historyItem.id)
      );

      // Add new products to the history
      cart.forEach((item) => {
        const existingItemIndex = updatedHistory.findIndex(
          (historyItem) => historyItem.id === item.id
        );

        if (existingItemIndex === -1) {
          // Add new product to history
          updatedHistory.push(item);
        } else {
          // Update quantity of existing product in the history
          updatedHistory[existingItemIndex].quantity = item.quantity;
        }
      });

      return updatedHistory;
    });
  }, [cart]);

  // Helper function to convert image URLs to Base64
  const handleDownloadPDF = async () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Order Details", 20, 20);

    let yPosition = 30;

    // Helper function to convert image URLs to Base64
    const getBase64Image = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute("crossOrigin", "anonymous"); // Handle CORS
        img.src = url;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, img.width, img.height);
          resolve(canvas.toDataURL("image/png")); // Convert to Base64
        };
        img.onerror = reject;
      });

    // Loop through cart items to create the PDF
    for (const item of cart) {
      const productDetails = `${item.name} - $${item.price} × ${
        item.quantity
      } = $${item.price * item.quantity}`;
      doc.text(productDetails, 20, yPosition);
      yPosition += 10;

      // Check if the item has an image and add it to the PDF
      if (item.img) {
        try {
          const imgData = await getBase64Image(item.img); // Convert image to Base64
          doc.addImage(imgData, "PNG", 20, yPosition, 40, 40); // Add image to PDF
          yPosition += 50; // Adjust position after image
        } catch (error) {
          console.error("Error loading image:", error);
          doc.text("Image could not be loaded", 20, yPosition);
          yPosition += 10;
        }
      }

      doc.text(`Added on: ${item.timestamp}`, 20, yPosition);
      yPosition += 10;
    }

    // Add totals
    doc.text(`Total: $${calculateTotal().toFixed(2)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Tax (5%): $${calculateTax().toFixed(2)}`, 20, yPosition);
    yPosition += 10;
    doc.text(
      `Grand Total: $${calculateGrandTotal().toFixed(2)}`,
      20,
      yPosition
    );

    // Save the PDF
    doc.save("order-details.pdf");
  };

  const handleCloseSuccessModal = () => {
    setIsOrderConfirmed(false); // Reset confirmation state to allow reopening
    setIsModalOpen(false); // Also close the confirmation modal
    dispatch({ type: "CLEAR_CART" });

  };

  const handleConfirmOrder = () => {
    setIsOrderConfirmed(true); // Show the confirmation message after order confirmation
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Cart Page</h1>

      {/* Cart Box */}
      {cart.length === 0 ? (
        <p className="text-xl font-semibold">Your cart is empty.</p>
      ) : (
        <div>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Product</th>
                <th className="border border-gray-300 p-2">Image</th>
                <th className="border border-gray-300 p-2">Price</th>
                <th className="border border-gray-300 p-2">Quantity</th>
                <th className="border border-gray-300 p-2">Total</th>
                <th className="border border-gray-300 p-2">Date Added</th>{" "}
                {/* New Column */}
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2">
                    <img
                      src={item.img}
                      className="size-14 object-cover mx-auto"
                      alt="img"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">${item.price}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ${item.price * item.quantity}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.timestamp}
                  </td>{" "}
                  {/* Show Timestamp */}
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() =>
                        dispatch({
                          type: "INCREMENT_QUANTITY",
                          payload: item.id,
                        })
                      }
                      className="px-2 bg-green-500 text-white rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() =>
                        dispatch({
                          type: "DECREMENT_QUANTITY",
                          payload: item.id,
                        })
                      }
                      className="px-2 bg-yellow-500 text-white rounded mx-2"
                    >
                      -
                    </button>
                    <button
                      onClick={() =>
                        dispatch({ type: "REMOVE_FROM_CART", payload: item.id })
                      }
                      className="px-2 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5 pt-5">
            <div className="mt-6 md:col-span-2">
              <p className="text-lg font-bold">
                Total: ${calculateTotal().toFixed(2)}
              </p>
              <p className="text-lg font-bold">
                Tax (5%): ${calculateTax().toFixed(2)}
              </p>
              <p className="text-xl font-bold">
                Grand Total: ${calculateGrandTotal().toFixed(2)}
              </p>

              {/* Take Order Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Take Order
              </button>
            </div>

            {/* Product History Box */}
            <div className="border p-4 mb-6 md:col-span-3 rounded-md shadow-md bg-gray-100">
              <h2 className="text-xl font-bold mb-3">Product History</h2>
              {productHistory.length === 0 ? (
                <p className="text-gray-500">
                  No products added to history yet!
                </p>
              ) : (
                <ul>
                  {productHistory.map((item) => (
                    <li key={item.id} className="mb-2 space-x-3 border-b">
                      <span className="font-bold">{item.name}</span>{" "}
                      <img
                        src={item.img}
                        className="size-11 object-cover mx-auto inline-flex"
                        alt=""
                      />{" "}
                      <span>
                        ${item.price} × {item.quantity} = $
                        {item.price * item.quantity} - {item.timestamp}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Order Details */}
      {isModalOpen && !isOrderConfirmed && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button (Cross) */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-2xl"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div id="order-details">
              <ul>
                {cart.map((item) => (
                  <li key={item.id} className="mb-2 flex items-center border-b">
                    <span className="font-bold">{item.name}</span> -{" "}
                    <img
                      src={item.img}
                      className="size-11 object-cover mx-auto"
                      alt=""
                    />{" "}
                    - ${item.price} × {item.quantity} = $
                    {item.price * item.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-bold">
                Total: ${calculateTotal().toFixed(2)}
              </p>
              <p className="font-bold">
                Tax (5%): ${calculateTax().toFixed(2)}
              </p>
              <p className="text-xl font-bold">
                Grand Total: ${calculateGrandTotal().toFixed(2)}
              </p>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleConfirmOrder}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message after Order Confirmation */}
      {isOrderConfirmed && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Order Confirmed</h2>
            <p className="text-lg">
              Your order has been confirmed successfully!
            </p>

            {/* Buttons (Download and Close) */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleDownloadPDF} // Function to download PDF
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Download PDF
              </button>
              <button
                onClick={handleCloseSuccessModal} // Close and reset the modal
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
