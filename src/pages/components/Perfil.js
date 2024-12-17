import './Perfil.css'; // Asegúrate de que el archivo CSS esté vinculado

const Perfil = ({ username, image, salaId }) => {

  const imagePath = require(`../../assets/images/image${image + 1}.png`);
  
  return (
    <div className="card">
      <div className="image-container">
        <img src={imagePath} alt={image} className="profile-image" />
      </div>
      <div className="text-container">
        <div className="username">{username}</div>
        <div className="salaId">{salaId}</div>
      </div>
    </div>
  );
};

export default Perfil;
