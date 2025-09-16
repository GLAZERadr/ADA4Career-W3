const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

describe('CVRegistry', function () {
  let CVRegistry;
  let cvRegistry;
  let owner;
  let user1;
  let user2;
  let approver;

  const sampleIpfsHash = 'QmSampleHash123456789';
  const sampleMetadataHash = 'QmMetadataHash987654321';
  const updatedIpfsHash = 'QmUpdatedHash111111111';
  const updatedMetadataHash = 'QmUpdatedMetadata222222222';

  beforeEach(async function () {
    [owner, user1, user2, approver] = await ethers.getSigners();

    CVRegistry = await ethers.getContractFactory('CVRegistry');
    cvRegistry = await CVRegistry.deploy();
    await cvRegistry.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await cvRegistry.owner()).to.equal(owner.address);
    });

    it('Should set owner as default approver', async function () {
      expect(await cvRegistry.isApprover(owner.address)).to.be.true;
    });

    it('Should initialize with zero statistics', async function () {
      const [totalSubmissions, totalApprovals, totalRejections] = await cvRegistry.getStats();
      expect(totalSubmissions).to.equal(0);
      expect(totalApprovals).to.equal(0);
      expect(totalRejections).to.equal(0);
    });
  });

  describe('CV Submission', function () {
    it('Should allow users to submit CV', async function () {
      await expect(
        cvRegistry.connect(user1).submitCV(sampleIpfsHash, sampleMetadataHash)
      ).to.emit(cvRegistry, 'CVSubmitted')
        .withArgs(user1.address, sampleIpfsHash, sampleMetadataHash, anyValue);

      const record = await cvRegistry.getCVRecord(user1.address);
      expect(record.ipfsHash).to.equal(sampleIpfsHash);
      expect(record.metadataHash).to.equal(sampleMetadataHash);
      expect(record.status).to.equal(1); // Pending
      expect(record.submitter).to.equal(user1.address);
    });

    it('Should reject duplicate hash submission', async function () {
      await cvRegistry.connect(user1).submitCV(sampleIpfsHash, sampleMetadataHash);

      await expect(
        cvRegistry.connect(user2).submitCV(sampleIpfsHash, sampleMetadataHash)
      ).to.be.revertedWith('Hash already used');
    });

    it('Should reject empty hash', async function () {
      await expect(
        cvRegistry.connect(user1).submitCV('', sampleMetadataHash)
      ).to.be.revertedWith('Hash cannot be empty');
    });

    it('Should prevent multiple submissions from same user', async function () {
      await cvRegistry.connect(user1).submitCV(sampleIpfsHash, sampleMetadataHash);

      await expect(
        cvRegistry.connect(user1).submitCV('QmAnotherHash', 'QmAnotherMetadata')
      ).to.be.revertedWith('CV already submitted or approved');
    });

    it('Should update total submissions counter', async function () {
      await cvRegistry.connect(user1).submitCV(sampleIpfsHash, sampleMetadataHash);

      const [totalSubmissions] = await cvRegistry.getStats();
      expect(totalSubmissions).to.equal(1);
    });
  });

  describe('CV Updates', function () {
    beforeEach(async function () {
      await cvRegistry.connect(user1).submitCV(sampleIpfsHash, sampleMetadataHash);
    });

    it('Should allow updating pending CV', async function () {
      await expect(
        cvRegistry.connect(user1).updateCV(updatedIpfsHash, updatedMetadataHash)
      ).to.emit(cvRegistry, 'CVUpdated')
        .withArgs(user1.address, sampleIpfsHash, updatedIpfsHash, updatedMetadataHash, anyValue);

      const record = await cvRegistry.getCVRecord(user1.address);
      expect(record.ipfsHash).to.equal(updatedIpfsHash);
      expect(record.metadataHash).to.equal(updatedMetadataHash);
    });

    it('Should not allow updating non-pending CV', async function () {
      // Approve the CV first
      await cvRegistry.connect(owner).approveCV(user1.address);

      await expect(
        cvRegistry.connect(user1).updateCV(updatedIpfsHash, updatedMetadataHash)
      ).to.be.revertedWith('Can only update pending CVs');
    });

    it('Should free up old hash when updating', async function () {
      await cvRegistry.connect(user1).updateCV(updatedIpfsHash, updatedMetadataHash);

      // Should be able to use the old hash with another user
      await cvRegistry.connect(user2).submitCV(sampleIpfsHash, sampleMetadataHash);
      const record = await cvRegistry.getCVRecord(user2.address);
      expect(record.ipfsHash).to.equal(sampleIpfsHash);
    });
  });

  describe('CV Approval', function () {
    beforeEach(async function () {
      await cvRegistry.connect(user1).submitCV(sampleIpfsHash, sampleMetadataHash);
    });

    it('Should allow owner to approve CV', async function () {
      await expect(
        cvRegistry.connect(owner).approveCV(user1.address)
      ).to.emit(cvRegistry, 'CVApproved')
        .withArgs(user1.address, owner.address, anyValue);

      const status = await cvRegistry.getCVStatus(user1.address);
      expect(status).to.equal(2); // Approved

      const [, totalApprovals] = await cvRegistry.getStats();
      expect(totalApprovals).to.equal(1);
    });

    it('Should allow designated approvers to approve CV', async function () {
      await cvRegistry.connect(owner).addApprover(approver.address);

      await expect(
        cvRegistry.connect(approver).approveCV(user1.address)
      ).to.emit(cvRegistry, 'CVApproved')
        .withArgs(user1.address, approver.address, anyValue);
    });

    it('Should reject non-approver attempts', async function () {
      await expect(
        cvRegistry.connect(user2).approveCV(user1.address)
      ).to.be.revertedWith('Not authorized to approve');
    });

    it('Should only approve pending CVs', async function () {
      // Approve once
      await cvRegistry.connect(owner).approveCV(user1.address);

      // Try to approve again
      await expect(
        cvRegistry.connect(owner).approveCV(user1.address)
      ).to.be.revertedWith('CV not pending approval');
    });
  });

  describe('CV Rejection', function () {
    const rejectionReason = 'Incomplete information';

    beforeEach(async function () {
      await cvRegistry.connect(user1).submitCV(sampleIpfsHash, sampleMetadataHash);
    });

    it('Should allow owner to reject CV with reason', async function () {
      await expect(
        cvRegistry.connect(owner).rejectCV(user1.address, rejectionReason)
      ).to.emit(cvRegistry, 'CVRejected')
        .withArgs(user1.address, owner.address, rejectionReason, anyValue);

      const record = await cvRegistry.getCVRecord(user1.address);
      expect(record.status).to.equal(3); // Rejected
      expect(record.rejectionReason).to.equal(rejectionReason);

      const [, , totalRejections] = await cvRegistry.getStats();
      expect(totalRejections).to.equal(1);
    });

    it('Should allow resubmission after rejection', async function () {
      await cvRegistry.connect(owner).rejectCV(user1.address, rejectionReason);

      // Should be able to submit again with new hash
      await cvRegistry.connect(user1).submitCV(updatedIpfsHash, updatedMetadataHash);

      const record = await cvRegistry.getCVRecord(user1.address);
      expect(record.status).to.equal(1); // Pending again
      expect(record.ipfsHash).to.equal(updatedIpfsHash);
    });
  });

  describe('Approver Management', function () {
    it('Should allow owner to add approvers', async function () {
      await expect(
        cvRegistry.connect(owner).addApprover(approver.address)
      ).to.emit(cvRegistry, 'ApproverAdded')
        .withArgs(approver.address);

      expect(await cvRegistry.isApprover(approver.address)).to.be.true;
    });

    it('Should allow owner to remove approvers', async function () {
      await cvRegistry.connect(owner).addApprover(approver.address);

      await expect(
        cvRegistry.connect(owner).removeApprover(approver.address)
      ).to.emit(cvRegistry, 'ApproverRemoved')
        .withArgs(approver.address);

      expect(await cvRegistry.isApprover(approver.address)).to.be.false;
    });

    it('Should not allow removing owner as approver', async function () {
      await expect(
        cvRegistry.connect(owner).removeApprover(owner.address)
      ).to.be.revertedWith('Cannot remove owner');
    });

    it('Should reject non-owner attempts to manage approvers', async function () {
      await expect(
        cvRegistry.connect(user1).addApprover(approver.address)
      ).to.be.revertedWithCustomError(cvRegistry, 'OwnableUnauthorizedAccount');
    });

    it('Should prevent adding zero address as approver', async function () {
      await expect(
        cvRegistry.connect(owner).addApprover(ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid address');
    });
  });

  describe('Gas Optimization Tests', function () {
    it('Should handle batch operations efficiently', async function () {
      // Submit multiple CVs
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const user = ethers.Wallet.createRandom().connect(ethers.provider);
        // Fund the user
        await owner.sendTransaction({ to: user.address, value: ethers.parseEther('1') });

        promises.push(
          cvRegistry.connect(user).submitCV(`QmHash${i}`, `QmMetadata${i}`)
        );
      }

      await Promise.all(promises);

      const [totalSubmissions] = await cvRegistry.getStats();
      expect(totalSubmissions).to.equal(5);
    });
  });

  // Helper function for testing events with dynamic values is imported at the top
});