import { useState, useEffect } from "react";
import { createReview } from "../../api/reviews.api";
import { Star, X } from "lucide-react";
import { Button } from "../ui/Button";

const ReviewForm = ({ productId, orderItemId, onReviewSubmitted, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Por favor selecciona una calificación");
      return;
    }

    if (!comment.trim()) {
      setError("Por favor escribe un comentario");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData = {
        product: productId,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
        ...(orderItemId && { order_item: orderItemId }),
      };

      await createReview(reviewData);
      setSuccess(true);
      
      // Limpiar formulario
      setRating(0);
      setTitle("");
      setComment("");
      
      // Notificar al componente padre
      if (onReviewSubmitted) {
        setTimeout(() => {
          onReviewSubmitted();
          if (onCancel) onCancel();
        }, 1500);
      }
    } catch (err) {
      console.error("Error creating review:", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error al enviar la reseña. Por favor intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);

      return (
        <button
          key={index}
          type="button"
          className="focus:outline-none transition-transform hover:scale-110"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          disabled={isSubmitting}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-300 text-gray-300"
            }`}
          />
        </button>
      );
    });
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 mb-2">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-1">
          ¡Reseña enviada!
        </h3>
        <p className="text-green-700">
          Tu reseña será revisada y publicada pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Escribe una reseña
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Calificación con estrellas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación *
          </label>
          <div className="flex items-center gap-2">{renderStars()}</div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating === 5 && "Excelente"}
              {rating === 4 && "Muy bueno"}
              {rating === 3 && "Bueno"}
              {rating === 2 && "Regular"}
              {rating === 1 && "Malo"}
            </p>
          )}
        </div>

        {/* Título */}
        <div>
          <label
            htmlFor="review-title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Título (opcional)
          </label>
          <input
            type="text"
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Resumen de tu experiencia"
            maxLength={255}
            disabled={isSubmitting}
          />
        </div>

        {/* Comentario */}
        <div>
          <label
            htmlFor="review-comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tu reseña *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Comparte tu experiencia con este producto..."
            disabled={isSubmitting}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length} caracteres
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || rating === 0 || !comment.trim()}
          >
            Enviar reseña
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;

