import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelheader";
import { FiTrash2 } from "react-icons/fi";
import { useState, useEffect, useContext } from "react";
import { db } from "../../services/firebaseConnection";
import { collection, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";

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
        let listCars = [] as CarsProps[];
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
        console.log(listCars);
      });
    }
    loadCars();
  }, [user]);
  return (
    <Container>
      <DashboardHeader />
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <section className="w-full bg-white rounded-lg relative">
          <button className=" absolute bg-white w-14 h-14 rounded-full flex items-center justify-center  top-2 right-2 drop-shadow-2xl ">
            <FiTrash2 size={26} color="#000" />
          </button>
          <img
            src="https://firebasestorage.googleapis.com/v0/b/webcarros-c24cb.firebasestorage.app/o/images%2FQ7gUpXFPgCejh0QnvaFrLCFCAI73%2Fcc7b2ac8-2fed-46b4-8667-8e5b790aa19f?alt=media&token=5da4b40f-e23f-4317-9ca9-d40e26e42d13"
            alt=""
            className="w-full rounded-lg mb-2 max-h-70"
          />
          <p className="font-bold mt-1 mb-2 px-2">Mercedez</p>

          <div className="flex flex-col px-2">
            <span>Ano:2016/216 | 230.00</span>
            <strong className="text-black font-bold mt-4 ">R$:150.00</strong>
          </div>

          <div className="w-full h-px bg-slate-200 my-2"></div>
          <div className=" px-2 pb-2">
            <span className="text-black">Guarulhos-SP</span>
          </div>
        </section>
      </main>
    </Container>
  );
}
