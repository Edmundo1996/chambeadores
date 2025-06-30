import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import MenuP from "../components/MenuP";

function HomeA() {
  return (
    <>
      <MenuP />
      <Container>
        <Outlet />
      </Container>
    </>
  );
}

export default HomeA;
