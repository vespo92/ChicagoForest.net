# Get Started: Launch Your P2P WiFi Network in 30 Days

**Quick-start guide to implement the marketing strategy**

---

## Week 1: Foundation & Planning

### Day 1-2: Define Your Pilot Area
**Goal:** Choose the best neighborhood for initial deployment

**Action steps:**
1. **Identify 3 candidate neighborhoods**
   - Look for: High density (apartments/condos), community spaces, high ISP costs
   - Avoid: Single-family sprawl, no rooftop access, low-income only (need mix)

2. **Score each location** (1-5 scale):
   - Population density: ___
   - Rooftop access availability: ___
   - Community engagement (existing orgs): ___
   - ISP cost burden: ___
   - Technical savvy (potential early adopters): ___

3. **Pick winner:** Highest total score

**Output:** Document with pilot neighborhood selection + rationale

---

### Day 3-4: Secure Supernode Locations
**Goal:** Get commitments for 3 rooftop/tower sites

**Target venues:**
- Coffee shops (foot traffic + community vibe)
- Community centers (public service + meeting space)
- Cooperative housing buildings (aligned values)
- Libraries (public trust + infrastructure)
- Local tech companies (CSR opportunity)

**Pitch template:**
> "We're launching a community-owned WiFi network in [Neighborhood]. We need rooftop space for a small wireless antenna (about the size of a smoke detector). In exchange, you get:
> - Free professional-grade WiFi for your business ($2,500 value)
> - Community recognition as a network hub
> - Priority bandwidth for your operations
>
> Can we schedule a site visit?"

**What you need:**
- Roof access agreement (1-year minimum)
- Power outlet access (< 20W usage, ~$3/month)
- Clear line of sight to other sites (300m+ range)

**Output:** 3 signed location agreements

---

### Day 5-7: Order Hardware
**Goal:** Get equipment arriving by Week 2

**Supernode kit (×3):**
- UniFi 6 LR Access Point: $200 each
- UISP AirFiber 60 LR radio: $1,500 each (or skip for closer sites)
- Outdoor ethernet cable (Cat6): $50
- Mounting hardware: $300
- Power over Ethernet injector: $50
- Total per site: ~$2,100 (or $600 without long-range radio)

**Community node kits (×20):**
- Raspberry Pi 4 (4GB) starter kit: $75 each
- High-gain WiFi USB adapter: $20 each
- Weatherproof case: $5 each
- MicroSD card (64GB, pre-flashed): included in kit
- Total per node: $100

**Where to buy:**
- UniFi: ui.com/store
- Raspberry Pi: adafruit.com, canakit.com
- WiFi adapters: Amazon (search "Alfa AWUS036ACH")

**Budget: ~$8,300 total** (3 supernodes + 20 nodes)

**Output:** Order confirmations + delivery tracking

---

## Week 2: Infrastructure Setup

### Day 8-10: Install Supernodes
**Goal:** Professional deployment of backbone network

**Installation checklist per site:**
- [ ] Roof/outdoor access secured
- [ ] Power source identified and tested
- [ ] Mounting hardware installed (secure to chimney/pole/wall)
- [ ] UniFi AP positioned for max coverage (300m radius)
- [ ] AirFiber radio aimed at other supernodes (if using)
- [ ] Ethernet cable run from roof to power source
- [ ] PoE injector connected
- [ ] Device powered on + adopted to controller

**Network configuration:**
- [ ] B.A.T.M.A.N. kernel module loaded (`modprobe batman-adv`)
- [ ] Mesh interface created (`batctl if add wlan0`)
- [ ] Yggdrasil installed and peered
- [ ] IPFS daemon running
- [ ] Monitoring enabled (uptime tracking)

**Use the automated script:**
```bash
# On each supernode device:
sudo bash /scripts/mesh-install.sh --mode=supernode --geohash=dp3w
```

**Test connectivity:**
```bash
# Check mesh neighbors
batctl n

# Should see other supernodes within range
# Example output:
# [B.A.T.M.A.N. adv 2024.x, MainIF/MAC: wlan0/aa:bb:cc:dd:ee:ff]
# IF             Neighbor              last-seen
# wlan0          aa:bb:cc:dd:ee:01    0.456s
# wlan0          aa:bb:cc:dd:ee:02    0.782s
```

**Output:** 3 operational supernodes with mesh connectivity

---

### Day 11-14: Configure & Test
**Goal:** Verify backbone performance before community rollout

**Performance testing:**
1. **Speed test between supernodes:**
   ```bash
   iperf3 -c [other-supernode-yggdrasil-ip]
   # Target: 100+ Mbps between supernodes
   ```

2. **Latency test:**
   ```bash
   ping -c 100 [other-supernode-yggdrasil-ip]
   # Target: <20ms average
   ```

3. **Failover test:**
   - Unplug one supernode
   - Verify traffic reroutes through remaining nodes
   - Should reconverge in <5 seconds

**Set up monitoring dashboard:**
- Use prometheus + grafana (containers)
- Metrics: Bandwidth, latency, packet loss, node count
- Public-facing URL: status.chicagoforest.net
- Shows real-time network health

**Internet gateway setup:**
- Configure NAT on supernode(s) with ISP connection
- Set bandwidth limits (prevent any single user hogging)
- Enable traffic prioritization (VoIP/video > bulk downloads)

**Output:** Verified backbone with 95%+ uptime over 72 hours

---

## Week 3: Community Recruitment

### Day 15-16: Build Web Presence
**Goal:** Make it easy for people to learn and sign up

**Website essentials:**
- [ ] Homepage with 30-second pitch (see MARKETING_STRATEGY.md)
- [ ] Coverage map (show 3 supernodes + expanding mesh)
- [ ] Signup form (collect: name, email, address, install preference)
- [ ] FAQ (answer the 5 top objections)
- [ ] Install guide (PDF download)

**Social media setup:**
- [ ] Create accounts: Twitter, Instagram, Nextdoor
- [ ] Post announcement: "We're building community WiFi in [Neighborhood]!"
- [ ] Include: Coverage map screenshot, signup link, install party date

**Print materials:**
- [ ] Design one-pager flyer (8.5×11)
  - Front: "Own Your Internet" headline + key benefits
  - Back: Coverage map + QR code to signup form
- [ ] Print 500 copies at local print shop ($50)

**Output:** Live website + social accounts + printed flyers

---

### Day 17-21: Grassroots Outreach
**Goal:** Recruit 20 early adopters for pilot

**Door-to-door canvassing:**
- Target buildings within 50m of supernodes (coverage overlap)
- Hit 200 units over 5 days (40/day = 2 hours of knocking)
- Pitch: "Hi! We're launching free community WiFi on your block. Want to join?"
- Leave flyer even if not home

**Community meetings:**
- Attend neighborhood association meeting
- Request 10-minute presentation slot
- Bring: Laptop with coverage map, live demo of mesh chat
- Pitch: "Internet is too expensive and unreliable. We're fixing that together."

**Local hangouts:**
- Coffee shops, parks, library
- Leave stack of flyers with QR code
- Chat with regulars about the network

**Online outreach:**
- Post in neighborhood Facebook groups
- Nextdoor announcement
- r/chicago thread with project details

**Goal:** 40 signups (assume 50% conversion to actual installs)

**Output:** 40 emails + addresses of interested residents

---

## Week 4: Install Fest & Launch

### Day 22-24: Prepare for Install Fest
**Goal:** Get ready to install 20 nodes in one weekend

**Event logistics:**
- [ ] Venue booked (community center or supernode host location)
- [ ] Tables + chairs for 30 people
- [ ] Power strips (10× 6-outlet)
- [ ] Food ordered (pizza, drinks)
- [ ] Music playlist (keep energy high)

**Hardware prep:**
- [ ] Flash all 20 microSD cards with mesh image
  - Use balenaEtcher: balena.io/etcher
  - Image: raspberrypi-mesh-cfn.img (build from mesh-install.sh)
- [ ] Pre-configure unique CFN addresses (geohash = pilot area)
- [ ] Label each kit with install ID (CFN-001 through CFN-020)
- [ ] Charge all Raspberry Pis (test boot sequence)

**Volunteer training:**
- [ ] Recruit 5-7 volunteers (ideally tech-savvy)
- [ ] Run through installation process (practice run)
- [ ] Assign roles: Registration, installation, troubleshooting, food
- [ ] Print volunteer guide (step-by-step)

**Output:** Event ready to rock

---

### Day 25-26: INSTALL FEST WEEKEND! 🎉
**Goal:** Get 20 nodes online and people EXCITED

**Saturday Schedule:**
- **2:00 PM** - Doors open, registration starts
  - Check people in, assign node kit
  - Verify address (map placement)
- **2:15 PM** - Welcome presentation (15 min)
  - "What is a mesh network?" (demo with interactive map)
  - "What you're building today"
  - "How to install at home"
- **2:30-4:30 PM** - Hands-on installation
  - Participants configure their nodes (WiFi SSID, password)
  - Test connectivity to nearby supernodes
  - Join community chat (on mesh!)
  - Troubleshoot any issues
- **4:30-5:00 PM** - Wrap-up & home installation
  - Show window/balcony placement tips
  - Weatherproofing guidance
  - Schedule follow-up for any issues
  - GROUP PHOTO with nodes!

**Sunday (Optional):**
- Home installation assistance
- Volunteers visit participants who need help
- Test full network connectivity

**Success metrics:**
- 15+ nodes configured at event (75% goal)
- 20 nodes online by end of weekend (100% goal)
- 50+ people attended (community awareness)

**Output:** 20 operational mesh nodes + energized community

---

### Day 27-30: Monitor & Storytelling
**Goal:** Prove it works + share the story

**Network monitoring:**
- Check dashboard daily: uptime, node count, bandwidth
- Respond to any issues within 24 hours
- Celebrate milestones: "Node #20 just came online!"

**Content creation:**
- [ ] Photo album from install fest (post to Instagram)
- [ ] User testimonial video (interview 3 participants)
  - "Why did you join?"
  - "How's the network working?"
  - "Would you recommend to neighbors?"
- [ ] Blog post: "We built a mesh network in 30 days"
  - Include: Coverage map, metrics, lessons learned
  - Publish on website + Medium + r/darknetplan

**Media outreach:**
- [ ] Press release to local news
  - Angle: "Chicago neighborhood builds own internet to escape ISP monopoly"
  - Include: Photos, stats (20 nodes, 50 attendees), cost savings
- [ ] Pitch to tech press (Ars Technica, Motherboard)
  - Angle: "Real-world community mesh network using B.A.T.M.A.N. + Yggdrasil"

**Community engagement:**
- [ ] Weekly check-in messages (mesh chat + email)
- [ ] Troubleshooting office hours (online, 1 hour/week)
- [ ] Plan next event (expansion to adjacent blocks)

**Output:** Documented success + momentum for Phase 2

---

## After 30 Days: Scale & Sustain

### Evaluate Pilot Results
**Measure:**
- Network uptime over 30 days (target: 95%+)
- Average speed (compare to ISP baseline)
- User satisfaction (send NPS survey)
- Cost savings per household (vs. $60/month ISP)

**Analyze:**
- What worked? (Double down)
- What didn't? (Fix for next phase)
- Unexpected challenges? (Document solutions)

**Share:**
- Publish results publicly (transparency builds trust)
- Open-source lessons learned (help other communities)

---

### Plan Phase 2: Neighborhood Expansion
**Goal:** 100 nodes across 3 neighborhoods by Month 6

**Tactics:**
1. **Recruit neighborhood champions**
   - Find 1-2 leaders per new neighborhood
   - Train them on install process
   - Support with hardware + marketing materials

2. **Replicate install fest model**
   - Monthly events in each neighborhood
   - 20 nodes per event
   - Build on lessons learned

3. **Develop economic model**
   - Introduce optional co-op membership ($10/month)
   - Funds: Maintenance, new supernodes, staff
   - Governance: Member voting on network decisions

4. **Expand supernode network**
   - Target: 10 total supernodes across 3 neighborhoods
   - Focus on high-density apartment buildings
   - Long-range links between neighborhood clusters

---

## Quick Decision Tree

**"Should I start with supernodes or community nodes?"**
→ Both! Supernodes provide coverage, community nodes add density.
→ Minimum viable network: 3 supernodes + 10 community nodes

**"What if I can't afford supernodes?"**
→ Start smaller: 10 community nodes in dense cluster (< 100m between nodes)
→ Upgrade to supernodes as funding comes in (grants, donations)

**"What if nobody signs up?"**
→ Start with friends/family + neighbors you know
→ Prove it works first, THEN recruit widely
→ Nothing sells like a working demo

**"What if the mesh doesn't perform well?"**
→ Check hardware placement (clear line of sight? away from metal/concrete?)
→ Verify channel selection (use WiFi analyzer app to avoid interference)
→ Add more nodes (density improves performance)
→ Upgrade supernodes to long-range radios (AirFiber) for backbone

**"How do I handle technical support?"**
→ Week 1: You (founder) handle everything
→ Month 2: Train 2-3 volunteer tech leads
→ Month 6: Hire part-time community tech (paid from co-op fees)

---

## Resources & Support

**Technical help:**
- MESH_NETWORK_SPEC.md (full implementation guide)
- scripts/mesh-install.sh (automated installation)
- Community chat (ask questions, get help from others)

**Marketing help:**
- MARKETING_STRATEGY.md (comprehensive playbook)
- assets/flyer-template.pdf (editable one-pager)
- Social media templates (copy/paste content)

**Financial help:**
- Grant database: techforgoodinstitute.org/grants
- Crowdfunding guide: kickstarter.com/help/handbook
- Co-op formation: ncbaclusa.coop/start-a-coop

**Community help:**
- NYC Mesh forums: nycmesh.net/chat
- r/darknetplan: reddit.com/r/darknetplan
- Battlemesh conference: battlemesh.org (annual gathering)

---

**You've got this. The hardest part is starting.**

Pick a date for your install fest. Order the hardware. Send the first email.

The rest will follow.

Let's build. 🌲📡

---

**Questions?** Open an issue on GitHub or email join@chicagoforest.net
