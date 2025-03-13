/*
  Este trecho garante que o código só será executado após o carregamento completo da página.
  Isso evita erros de manipulação do DOM antes que os elementos estejam disponíveis.
*/
document.addEventListener("DOMContentLoaded", () => {
  // URL base da API da FIPE
  const API_BASE = "https://parallelum.com.br/fipe/api/v1";

  // Variável para armazenar o tipo de veículo selecionado (inicialmente "motos")
  let selectedType = "motos";

  // Seleciona os elementos do DOM que serão manipulados
  const typeButtons = document.querySelectorAll("#vehicles_types li"); // Botões de tipo de veículo
  const brandSelect = document.getElementById("vehicles_brand"); // Select de marcas
  const modelSelect = document.getElementById("vehicles_model"); // Select de modelos
  const yearSelect = document.getElementById("vehicles_year"); // Select de anos
  const searchButton = document.querySelector(".search_button"); // Botão de busca
  const modal = document.querySelector(".modal"); // Modal de exibição dos dados
  const closeModal = document.querySelector(".close"); // Botão para fechar o modal

  /*
    Função para buscar dados da API.
    Recebe a URL da requisição e retorna os dados em formato JSON.
    Em caso de erro, exibe uma mensagem no console e um alerta para o usuário.
  */
  async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      alert("Erro ao carregar dados. Tente novamente.");
      return null;
    }
  }

  /*
    Adiciona um eventListener para cada botão de tipo de veículo.
    Quando um botão é clicado:
      1. Remove a classe "active" do botão anterior.
      2. Adiciona a classe "active" ao botão clicado.
      3. Atualiza a variável selectedType com o tipo de veículo selecionado.
      4. Chama a função loadBrands() para carregar as marcas correspondentes.
  */
  typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelector("#vehicles_types .active")
        .classList.remove("active");
      button.classList.add("active");
      selectedType = button.getAttribute("data-type");
      loadBrands();
    });
  });

  /*
    Função para carregar as marcas de veículos.
    Limpa os selects de marca, modelo e ano.
    Desabilita os selects de modelo e ano.
    Faz uma requisição à API para obter as marcas do tipo de veículo selecionado.
    Preenche o select de marcas com as opções retornadas.
  */
  async function loadBrands() {
    brandSelect.innerHTML = "<option value=''>Selecione...</option>";
    modelSelect.innerHTML = "";
    yearSelect.innerHTML = "";
    brandSelect.disabled = true;
    modelSelect.disabled = true;
    yearSelect.disabled = true;

    const brands = await fetchData(`${API_BASE}/${selectedType}/marcas`);
    brands.forEach((brand) => {
      let option = document.createElement("option");
      option.value = brand.codigo;
      option.textContent = brand.nome;
      brandSelect.appendChild(option);
    });
    brandSelect.disabled = false;
  }

  /*
    Adiciona um eventListener ao select de marcas.
    Quando uma marca é selecionada:
      1. Limpa os selects de modelo e ano.
      2. Desabilita os selects de modelo e ano.
      3. Faz uma requisição à API para obter os modelos da marca selecionada.
      4. Preenche o select de modelos com as opções retornadas.
  */
  brandSelect.addEventListener("change", async () => {
    modelSelect.innerHTML = "<option value=''>Selecione...</option>";
    yearSelect.innerHTML = "";
    modelSelect.disabled = true;
    yearSelect.disabled = true;

    const models = await fetchData(
      `${API_BASE}/${selectedType}/marcas/${brandSelect.value}/modelos`
    );
    models.modelos.forEach((model) => {
      let option = document.createElement("option");
      option.value = model.codigo;
      option.textContent = model.nome;
      modelSelect.appendChild(option);
    });
    modelSelect.disabled = false;
  });

  /*
    Adiciona um eventListener ao select de modelos.
    Quando um modelo é selecionado:
      1. Limpa o select de anos.
      2. Desabilita o select de anos.
      3. Faz uma requisição à API para obter os anos do modelo selecionado.
      4. Preenche o select de anos com as opções retornadas.
  */
  modelSelect.addEventListener("change", async () => {
    yearSelect.innerHTML = "<option value=''>Selecione...</option>";
    yearSelect.disabled = true;

    const years = await fetchData(
      `${API_BASE}/${selectedType}/marcas/${brandSelect.value}/modelos/${modelSelect.value}/anos`
    );
    years.forEach((year) => {
      let option = document.createElement("option");
      option.value = year.codigo;
      option.textContent = year.nome;
      yearSelect.appendChild(option);
    });
    yearSelect.disabled = false;
  });

  /*
    Adiciona um eventListener ao select de anos.
    Quando um ano é selecionado, exibe o botão de busca.
  */
  yearSelect.addEventListener("change", function () {
    if (yearSelect.value) {
      searchButton.classList.add("search_button_show");
    }
  });

  /*
    Adiciona um eventListener ao botão de busca.
    Quando o botão é clicado:
      1. Monta a URL da API com os valores selecionados (tipo, marca, modelo e ano).
      2. Faz uma requisição à API para obter os dados do veículo.
      3. Preenche o modal com os dados retornados.
      4. Exibe o modal.
  */
  searchButton.addEventListener("click", async () => {
    try {
      const url = `${API_BASE}/${selectedType}/marcas/${brandSelect.value}/modelos/${modelSelect.value}/anos/${yearSelect.value}`;
      const vehicleData = await fetchData(url);

      if (!vehicleData) {
        throw new Error("Dados do veículo não encontrados.");
      }

      // Preenche o modal com os dados do veículo
      document.querySelector(".vehicle_name").textContent = vehicleData.Modelo;
      document.querySelector(".reference_month .value").textContent =
        vehicleData.MesReferencia;
      document.querySelector(".fipe_code .value").textContent =
        vehicleData.CodigoFipe;
      document.querySelector(".brand .value").textContent = vehicleData.Marca;
      document.querySelector(".year .value").textContent =
        vehicleData.AnoModelo;
      document.querySelector(".price").textContent = vehicleData.Valor;

      // Exibe o modal
      modal.classList.remove("hide_modal");
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      alert("Erro ao buscar dados do veículo. Tente novamente.");
    }
  });

  /*
    Adiciona um eventListener ao botão de fechar o modal.
    Quando o botão é clicado, oculta o modal.
  */
  closeModal.addEventListener("click", () => {
    modal.classList.add("hide_modal");
  });

  /*
    Carrega as marcas iniciais ao abrir a página.
    Isso garante que o select de marcas já esteja preenchido com as opções do tipo de veículo padrão ("motos").
  */
  loadBrands();
});
