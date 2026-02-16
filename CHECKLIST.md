# Pre-Deployment Checklist

Use this checklist before deploying to testnet or mainnet.

## ✅ Pre-Deployment Checks

### Environment Setup
- [ ] `.env` file created from `.env.example`
- [ ] Private key added to `.env` (never commit this!)
- [ ] RPC URLs configured for target networks
- [ ] API keys added for contract verification
- [ ] Test accounts have sufficient testnet ETH

### Code Review
- [ ] Contract code reviewed and understood
- [ ] Constructor parameters planned and documented
- [ ] Initial royalty settings decided (start with 0 recommended)
- [ ] Role holder addresses identified and documented
- [ ] Multi-sig wallet prepared for production (if applicable)

### Testing
- [ ] Local tests pass: `npm test`
- [ ] Local deployment successful: `npm run deploy:local`
- [ ] Interactive testing completed and behavior verified
- [ ] Edge cases tested (zero fees, role permissions, etc.)

### Documentation
- [ ] README.md reviewed
- [ ] CONTRACTS.md documentation read and understood
- [ ] GASLESS-PATTERNS.md reviewed for UX strategy
- [ ] Deployment plan documented

## 🧪 Testnet Deployment Checklist

### Pre-Deployment
- [ ] Testnet selected (Base Sepolia recommended)
- [ ] Test ETH obtained from faucet
- [ ] Network configuration verified in `hardhat.config.js`
- [ ] Deployment parameters prepared

### Deployment
- [ ] Deploy contracts: `npm run deploy:base-testnet`
- [ ] Save contract addresses
- [ ] Verify transactions completed
- [ ] Wait for confirmations (5-10 blocks)

### Post-Deployment
- [ ] Verify contracts on block explorer
- [ ] Test minting functionality
- [ ] Test transfers with and without royalty
- [ ] Test burning functionality
- [ ] Verify role-based access control
- [ ] Test royalty configuration changes

### Documentation
- [ ] Create deployment log (see `deployments/` folder)
- [ ] Document all contract addresses
- [ ] Document role holder addresses
- [ ] Share explorer links with team

## 🚀 Mainnet Deployment Checklist

### Critical Pre-Deployment
- [ ] **SECURITY AUDIT COMPLETED** (highly recommended)
- [ ] All testnet tests passed
- [ ] Production private key secured (hardware wallet recommended)
- [ ] Multi-sig wallet prepared and tested
- [ ] Team trained on contract operations
- [ ] Incident response plan in place

### Pre-Deployment Review
- [ ] Constructor parameters finalized and triple-checked
- [ ] Initial royalty set to 0 (recommended)
- [ ] Role distribution plan finalized
- [ ] Gas price strategy decided
- [ ] Sufficient ETH for deployment in deployer wallet

### Deployment
- [ ] Double-check network is correct (avoid deploying to wrong network!)
- [ ] Deploy with appropriate gas settings
- [ ] Save deployment transaction hash
- [ ] Wait for sufficient confirmations (10-20 blocks)
- [ ] Verify contracts immediately after deployment

### Post-Deployment Configuration
- [ ] Grant MINTER_ROLE to oracle/backend service
- [ ] Grant BURNER_ROLE to appropriate service
- [ ] Grant ROYALTY_ADMIN_ROLE to treasury/governance
- [ ] Transfer DEFAULT_ADMIN_ROLE to multi-sig (if not deployer)
- [ ] Verify all role assignments

### Verification & Testing
- [ ] Contracts verified on Etherscan/Basescan/Arbiscan
- [ ] Perform small test mint
- [ ] Perform small test transfer
- [ ] Verify royalty mechanism (if enabled)
- [ ] Test burn functionality
- [ ] Verify all role-based operations work

### Operational Readiness
- [ ] Oracle/backend integrated and tested
- [ ] Monitoring set up for contract events
- [ ] Admin dashboard operational
- [ ] User-facing documentation updated with addresses
- [ ] Support team trained
- [ ] Backup and recovery procedures documented

### Security Ongoing
- [ ] Monitor contract for unexpected transactions
- [ ] Set up alerts for large transfers
- [ ] Regular audits of role holders
- [ ] Plan for emergency response
- [ ] Keep track of all role changes

## 📊 Post-Deployment Monitoring

### Daily Checks (First Week)
- [ ] Review all transactions
- [ ] Check balances and total supply
- [ ] Verify royalty collection
- [ ] Monitor gas costs
- [ ] Check for any errors or reverts

### Weekly Checks (Ongoing)
- [ ] Review role holder activity
- [ ] Verify royalty recipient balance
- [ ] Check total supply trends
- [ ] Monitor user adoption metrics
- [ ] Review any support tickets

### Monthly Reviews
- [ ] Full security review
- [ ] Economic analysis (royalty collection, token distribution)
- [ ] Gas cost optimization review
- [ ] Documentation updates
- [ ] Plan parameter adjustments if needed

## 🔐 Security Incident Response

If you discover a security issue:

1. **DO NOT PANIC** - Take a deep breath
2. **ASSESS** - Understand the scope and severity
3. **CONTAIN** - If possible, pause risky operations
4. **NOTIFY** - Alert all stakeholders immediately
5. **RESPOND** - Execute your incident response plan
6. **DOCUMENT** - Record all actions taken
7. **REVIEW** - Post-mortem and lessons learned

Emergency contacts:
- Technical Lead: [Add contact]
- Security Auditor: [Add contact if available]
- Multi-sig Signers: [Add contacts]

## 📝 Deployment Log Template

Keep a log for each deployment:

```
Network: [Sepolia / Base / Arbitrum / etc.]
Date: [YYYY-MM-DD]
Deployer Address: [0x...]
Gas Price Used: [X gwei]

Stagecoin:
  - Address: [0x...]
  - Transaction Hash: [0x...]
  - Block Number: [######]
  - Verified: [Yes/No]
  - Explorer Link: [https://...]

SentientCents:
  - Address: [0x...]
  - Transaction Hash: [0x...]
  - Block Number: [######]
  - Verified: [Yes/No]
  - Explorer Link: [https://...]

Initial Configuration:
  - Admin: [0x...]
  - Minter: [0x...]
  - Burner: [0x...]
  - Royalty Admin: [0x...]
  - Royalty Recipient: [0x...]
  - Royalty BPS: [0]

Notes:
- [Any important notes about this deployment]
```

## ✨ Success Criteria

Your deployment is successful when:

- [x] Contracts deployed to correct network
- [x] All roles assigned correctly
- [x] Contracts verified on block explorer
- [x] Test transactions completed successfully
- [x] Documentation updated with addresses
- [x] Team can access and interact with contracts
- [x] Monitoring is operational
- [x] No security concerns identified

---

**Remember**: Take your time, double-check everything, and don't hesitate to test on testnet multiple times before going to mainnet!
