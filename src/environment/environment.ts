
const env = (window as any)['env'] || {};

export const environment = {

  BackEndApi: 'https://localhost:44355/api',
  Endpoints: {
    tripletVisualization: {
      availableCPs: '/triplets/availableCPs',
      middleCPsWithFamily: '/triplets/middleCPsWithFamily',
    }
  }
}
