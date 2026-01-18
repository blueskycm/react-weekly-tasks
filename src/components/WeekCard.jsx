import { Link } from 'react-router-dom';

const WeekCard = ({ title, subtitle, description, path, tagText }) => {
  return (
    <div className="col-md-4">
      <div className="card h-100 shadow-sm border-0 hover-shadow">
        <div className="card-body">
          <h5 className="card-title fw-bold text-primary">{title}</h5>
          {/* 自動調整深淺色模式 */}
          <h6 className="card-subtitle mb-2 text-body-secondary">{subtitle}</h6>

          <p className="card-text text-body">
            {description}
          </p>

          <Link to={path} className="btn btn-outline-primary w-100 stretched-link">
            {tagText || "查看作業"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WeekCard;