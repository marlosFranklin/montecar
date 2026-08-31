import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Container } from "../../components/container";

export function Home() {
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
  const [cars, setCars] = useState<CarsProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([]);
  const [searchCar, setSearchCar] = useState("");

  useEffect(() => {
    loadCars();
  }, []);
  function loadCars() {
    const carsRef = collection(db, "cars");
    const queryRef = query(carsRef, orderBy("created", "desc"));

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
    });
  }

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id]);
  }

  async function handleSearch() {
    if (searchCar == "") {
      loadCars();
      return;
    }

    setCars([]);
    setLoadImages([]);

    const q = query(
      collection(db, "cars"),
      where("name", ">=", searchCar.toUpperCase()),
      where("name", "<=", searchCar.toUpperCase() + "\uf8ff"),
    );

    const querySnapshot = await getDocs(q);
    let listCars = [] as CarsProps[];
    querySnapshot.forEach((doc) => {
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
  }
  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
          value={searchCar}
          onChange={(e) => setSearchCar(e.target.value)}
          type="text"
          placeholder="digite o nome do carro "
          className="w-full border-gray-400 border rounded-lg h-9 px-3 outline-0  "
        />
        <button
          onClick={handleSearch}
          className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg"
        >
          buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Carros novos e usados em todo Brasil
      </h1>
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Link key={car.id} to={`/car/${car.id}`}>
            <section className="w-full bg-white rounded-lg">
              <div
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{
                  display: loadImages.includes(car.id) ? "none" : " block",
                }}
              ></div>
              <img
                className=" w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                src={car.images[0].url}
                alt="carro"
                onLoad={() => handleImageLoad(car.id)}
                style={{
                  display: loadImages.includes(car.id) ? "block" : " none",
                }}
              />
              <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>
              <div className="flex flex-col px-2 ">
                <span className="text-zinc-700 mb-6">
                  Ano {car.year} | {car.km} km
                </span>
                <strong className=" text-black font-medium text-xl">
                  {" "}
                  R$ {car.price}
                </strong>
              </div>
              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-zinc-700">{car.city}</span>
              </div>
            </section>
          </Link>
        ))}
      </main>
    </Container>
  );
}
