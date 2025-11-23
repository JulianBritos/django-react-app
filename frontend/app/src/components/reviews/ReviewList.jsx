import { useState, useEffect } from "react";
import { getProductReviews, markReviewHelpful } from "../../api/reviews.api";
import { Star, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";

const ReviewList = ({ productId, currentUserId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [helpfulVotes, setHelpfulVotes] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getProductReviews(productId);
        const reviewsData = Array.isArray(data) ? data : data.results || [];
        setReviews(reviewsData);
        
        // Inicializar estado de votos útiles
        const votesState = {};
        reviewsData.forEach((review) => {
          if (review.is_helpful_by_user !== null) {
            votesState[review.id] = review.is_helpful_by_user;
          }
        });
        setHelpfulVotes(votesState);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Error al cargar las reseñas");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleMarkHelpful = async (reviewId, isHelpful) => {
    try {
      await markReviewHelpful(reviewId, isHelpful);
      
      // Actualizar estado local
      setHelpfulVotes((prev) => ({
        ...prev,
        [reviewId]: isHelpful
      }));

      // Actualizar contadores en la reseña
      setReviews((prevReviews) =>
        prevReviews.map((review) => {
          if (review.id === reviewId) {
            const oldVote = helpfulVotes[reviewId];
            const newHelpfulCount = review.helpful_count || 0;
            const newNotHelpfulCount = review.not_helpful_count || 0;

            if (oldVote === null) {
              // Nuevo voto
              return {
                ...review,
                helpful_count: isHelpful ? newHelpfulCount + 1 : newHelpfulCount,
                not_helpful_count: !isHelpful ? newNotHelpfulCount + 1 : newNotHelpfulCount,
              };
            } else if (oldVote !== isHelpful) {
              // Cambio de voto
              return {
                ...review,
                helpful_count: isHelpful ? newHelpfulCount + 1 : Math.max(0, newHelpfulCount - 1),
                not_helpful_count: !isHelpful ? newNotHelpfulCount + 1 : Math.max(0, newNotHelpfulCount - 1),
              };
            }
          }
          return review;
        })
      );
    } catch (err) {
      console.error("Error marking review helpful:", err);
      alert("Error al registrar tu voto");
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-300 text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">Cargando reseñas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aún no hay reseñas para este producto.</p>
        <p className="text-sm text-gray-400 mt-2">Sé el primero en dejar una reseña.</p>
      </div>
    );
  }

  // Calcular estadísticas
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas de reseñas */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Basado en {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
            </p>
          </div>
        </div>

        {/* Distribución de calificaciones */}
        <div className="space-y-2 mt-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  {review.is_verified_purchase && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      <CheckCircle className="w-3 h-3" />
                      Compra verificada
                    </span>
                  )}
                </div>
                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {review.title}
                  </h4>
                )}
                <p className="text-sm text-gray-600">
                  Por <span className="font-medium">{review.user_name || review.user_email}</span>{" "}
                  el {formatDate(review.created_at)}
                </p>
              </div>
            </div>

            {review.comment && (
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {review.comment}
              </p>
            )}

            {/* Botones de útil/no útil */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                ¿Te resultó útil esta reseña?
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkHelpful(review.id, true)}
                  className={`flex items-center gap-1 ${
                    helpfulVotes[review.id] === true
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.helpful_count || 0}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkHelpful(review.id, false)}
                  className={`flex items-center gap-1 ${
                    helpfulVotes[review.id] === false
                      ? "text-red-600 bg-red-50"
                      : "text-gray-600"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{review.not_helpful_count || 0}</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;

