import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelheader";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useState, useEffect, useContext } from "react";
import { db, storage } from "../../services/firebaseConnection";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

interface CarsProps {
  id: string;
  uid: string;
  name: string;
  city: string;
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

export function Dashboard() {
  const [cars, setCars] = useState<CarsProps[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }
    function loadCars() {
      const carsRef = collection(db, "cars");
      const queryRef = query(carsRef, where("uid", "==", user?.uid));

      getDocs(queryRef).then((snapshot) => {
        const listCars = [] as CarsProps[];
        snapshot.forEach((doc) => {
          listCars.push({
            id: doc.id,
            name: doc.data().name,
            year: doc.data().year,
            km: doc.data().km,
            city: doc.data().city,
            price: doc.data().price,
            uid: doc.data().uid,
            images: doc.data().images,
          });
        });
        setCars(listCars);
      });
    }
    loadCars();
  }, [user]);

  async function handleDeleteCar(car: CarsProps) {
    const itemCar = car;
    const docRef = doc(db, "cars", itemCar.id);
    await deleteDoc(docRef);
    itemCar.images.map(async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`;
      const imageRef = ref(storage, imagePath);
      try {
        await deleteObject(imageRef);
        setCars(cars.filter((car) => car.id !== itemCar.id));
      } catch (error) {
        console.log(`erro ao deletar imagem`, error);
      }
    });
  }
  return (
    <Container>
      <DashboardHeader />
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <section key={car.id} className="w-full bg-white rounded-lg relative">
            <div className="absolute top-2 right-2 flex gap-2">
              <Link
                to={`/dashboard/edit/${car.id}`}
                aria-label={`Editar ${car.name}`}
                title="Editar veículo"
                className="bg-white w-12 h-12 rounded-full flex items-center justify-center drop-shadow-2xl"
              >
                <FiEdit2 size={22} color="#000" />
              </Link>
              <button
                onClick={() => handleDeleteCar(car)}
                aria-label={`Excluir ${car.name}`}
                title="Excluir veículo"
                className="bg-white w-12 h-12 rounded-full flex items-center justify-center drop-shadow-2xl"
              >
                <FiTrash2 size={24} color="#000" />
              </button>
            </div>
            <img
              src={car.images[0].url}
              alt={`foto veiculo ${car.name}`}
              className="w-full rounded-lg mb-2 max-h-70"
            />
            <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>

            <div className="flex flex-col px-2">
              <span>
                Ano:{car.year} | {car.km} km
              </span>
              <strong className="text-black font-bold mt-4 ">
                R$:{car.price}
              </strong>
            </div>

            <div className="w-full h-px bg-slate-200 my-2"></div>
            <div className=" px-2 pb-2">
              <span className="text-black">{car.city}</span>
            </div>
          </section>
        ))}
      </main>
    </Container>
  );
}
