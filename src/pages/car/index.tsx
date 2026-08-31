import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Container } from "../../components/container";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Swiper, SwiperSlide } from "swiper/react";

interface CarsProps {
  id: string;
  uid: string;
  name: string;
  city: string;
  model: string;
  description: string;
  created: string;
  owner: string;
  whatsapp: string;
  year: string;
  price: string | number;
  km: string;
  images: CarImageProps[];
}

interface CarImageProps {
  name: string;
  id: string;
  uid: string;
  url: string;
}
export function CarDetail() {
  const [car, setCar] = useState<CarsProps>();
  const [sliderPreView, setSiliderPreView] = useState<number>(2);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCar() {
      if (!id) {
        return;
      }

      const docRef = doc(db, "cars", id);
      getDoc(docRef).then((snapshot) => {
        if (!snapshot.data()) {
          navigate("/");
        }
        console.log(snapshot.data());
        setCar({
          id: snapshot.id,
          name: snapshot.data()?.name,
          year: snapshot.data()?.year,
          city: snapshot.data()?.city,
          model: snapshot.data()?.model,
          uid: snapshot.data()?.uid,
          description: snapshot.data()?.description,
          created: snapshot.data()?.created,
          km: snapshot.data()?.km,
          owner: snapshot.data()?.owner,
          price: snapshot.data()?.price,
          whatsapp: snapshot.data()?.whatsapp,
          images: snapshot.data()?.images,
        });
      });
    }
    loadCar();
  }, [id]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 720) {
        setSiliderPreView(1);
      } else {
        setSiliderPreView(2);
      }
    }
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <Container>
      {car && (
        <Swiper
          slidesPerView={sliderPreView}
          pagination={{ clickable: true }}
          navigation
        >
          {car?.images.map((image) => (
            <SwiperSlide key={image.name}>
              <img src={image.url} className="w-full h-96 object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {car && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className=" flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h1 className=" font-bold text-xl text-black">{car?.name}</h1>
            <span className=" font-bold text-xl text-black">
              R${car?.price}
            </span>
          </div>
          <p>{car?.model}</p>

          <div className="flex w-full gap-6 my-4 ">
            <div className=" flex flex-col gap-4">
              <div>
                <p>Cidade</p>
                <strong>{car?.city}</strong>
              </div>
              <div>
                <p>Ano</p>
                <strong>{car?.year}</strong>
              </div>
            </div>
            <div className=" flex flex-col gap-4">
              <div>
                <p>Km</p>
                <strong>{car?.km}</strong>
              </div>
            </div>
          </div>

          <strong>Descrição:</strong>
          <p className=" mb-4">{car?.description}</p>
          <strong>Telefone/Whatsapp</strong>
          <p>{car?.whatsapp}</p>
          <a
            href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá vi esse ${car?.name} e fiquei interessado`}
            target="_blanck"
            className="bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium cursor-pointer"
          >
            Conversar com vendedor
            <FaWhatsapp size={26} color="#fff" />
          </a>
        </main>
      )}
    </Container>
  );
}
