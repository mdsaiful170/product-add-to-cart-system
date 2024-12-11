import { useContext, useState } from "react";
import { productData } from "./productData";
import { CartContext } from "./CartContext";

const ProductPage = () => {
  const { dispatch } = useContext(CartContext);
  const [message, setMessage] = useState("");

  const addToCart = (product) => {
    dispatch({ type: "ADD_TO_CART", payload: product });
    setMessage(`${product.name} added to cart successfully!`);
    setTimeout(() => {
      setMessage(""); // Hide message after 2 seconds
    }, 2000);
  };

  return (
    <div>
      <h1>Product Page</h1>

      {/* Success Message */}
      {message && (
        <p className="text-green-500 text-center font-bold my-4">{message}</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {productData.map((product) => (
          <div key={product.id} className="border p-4">
            <img
              src={product.img}
              alt={product.name}
              className="w-1/2 mx-auto h-[12rem] object-cover"
            />
            <h2>{product.name}</h2>
            <p>${product.price}</p>
            <button
              onClick={() => addToCart(product)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
