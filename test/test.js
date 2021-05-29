const { expect } = require("chai");

describe("Niftie Gram", function() {
  var accounts = null
  var NiftieToken = null
  var NiftieMarketplace = null

  this.beforeAll(async function() {
    accounts = await ethers.getSigners()
    NiftieToken = await ethers.getContractFactory("NiftieToken")
    NiftieMarketplace = await ethers.getContractFactory("NiftieMarketplace")
  })

  it("deploy", async function() {
    const token = await NiftieToken.deploy()
    await token.deployed()

    console.log("token address: " + token.address)

    const marketplace = await NiftieMarketplace.deploy()
    await marketplace.deployed()

    console.log("marketplace address: " + marketplace.address)

    // await hre.ethernal.push({
    //   name: 'NiftieToken',
    //   address: token.address
    // })

    // await hre.ethernal.push({
    //   name: 'NiftieMarketplace',
    //   address: marketplace.address
    // })

    const user = accounts[1]
    const buyer = accounts[2]

    await token.connect(user).create("sharing love")

    console.log("created")

    const createdNiftyId = 1

    const createdNifty = await token.nifties(1)

    console.log(`created new nifty - uri ${createdNifty.uri} - creator ${createdNifty.creator}`)

    const askingPrice = 100 // ethers.utils.parseEther("1")

    await token.connect(user).approve(marketplace.address, createdNiftyId)

    await marketplace.connect(user).addOffer(
      createdNiftyId,
      token.address,
      askingPrice.toString()
    )

    const createdOfferId = 0

    const createdOffer = await marketplace.offers(createdOfferId)

    console.log(`created new offer - askingPrice ${createdOffer.askingPrice.toNumber()} - seller ${createdOffer.seller}`)

    await marketplace.connect(buyer).acceptOffer(
      createdOfferId,
      { value: askingPrice }
    )

    const acceptedOrder = await marketplace.offers(createdOfferId)

    console.log(`accepted offer status - ${acceptedOrder.isAccepted} - buyer ${buyer.address}`)
  })

  it.only("transfer", async function() {
    const token = NiftieToken.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3")
    const marketplace = NiftieMarketplace.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
    
    // const from = accounts[2]
    // const to = accounts[3]
    // const tokenId = 1

    // await token.connect(from).create("testing")
    // await token.connect(from).approve(marketplace.address, tokenId)
    // await marketplace.connect(from).addOffer(tokenId, token.address, "100")

    // await marketplace.connect(accounts[2]).acceptOffer(2, { value: 10000 })
    await token.connect(accounts[2]).approve(marketplace.address, 1)
    await marketplace.connect(accounts[2]).addOffer(1, token.address, "10000") 

    console.dir("done")

    // await token.connect(from).transferFrom(from.address, to.address, tokenId)
  })
})