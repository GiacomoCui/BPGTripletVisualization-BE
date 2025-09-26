
const env = (window as any)['env'] || {};

export const environment = {

  BackEndApi: 'https://localhost:44355/api',
  Endpoints: {
    tripletVisualization: {
      triplets: '/triplets/triplet',
      availableCPs: '/triplets/availableCPs',
      middleCPsWithFamily: '/triplets/middleCPsWithFamily',
      findAvailableCPs: '/triplets/AvailableCPs',
      findTriplets: '/triplets/findOnecp',
      findAsNumber: 'middleAS=',
      findQueryFamily: 'queryFamily=',
      findIPNumber: 'peerIPAddress=',
      findPeerAS: 'peerAS=',
      findById: 'id=',
    }
  }
}
