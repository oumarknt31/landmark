---
id: computer-networks
title: Computer Networks
subject: cs
course: chapter-3
estimatedMinutes: 8
---

# Computer Networks

A **network** is a set of computers that can exchange data. The Internet is the largest network, a global mesh of smaller networks, all agreeing on the same protocols so any machine can in principle talk to any other.

## The layered model

Network protocols are organised in **layers**, each one building on the services of the layer below. A common simplification of the OSI model:

```
┌─────────────────────────────────────┐
│ Application   (HTTP, DNS, SMTP)     │  what your program speaks
├─────────────────────────────────────┤
│ Transport     (TCP, UDP)            │  reliability, ordering
├─────────────────────────────────────┤
│ Network       (IP)                  │  addressing, routing
├─────────────────────────────────────┤
│ Link          (Ethernet, Wi-Fi)     │  single-hop physical transmission
└─────────────────────────────────────┘
```

A web request travels down the stack on the sender, across the wire, and back up the stack on the receiver.

## IP addresses

Every device on a network has an **IP address**, a unique number used to deliver packets to the right destination.

- **IPv4** addresses are 32 bits, usually written as four decimal numbers: `192.168.1.42`.
- **IPv6** addresses are 128 bits and look like `2606:4700:4700::1111`. We needed IPv6 because the world ran out of IPv4 addresses.

Routers along the path use the IP address to forward packets, hop by hop, until they arrive.

## TCP and UDP

The two main **transport-layer** protocols:

**TCP** (Transmission Control Protocol) gives you a reliable, ordered byte stream:

- Establishes a connection with a three-way handshake.
- Acknowledges every chunk and retransmits anything that's lost.
- Reorders packets that arrive out of sequence.
- Slows down when the network is congested.

The price is latency and overhead, every guarantee costs round-trips.

**UDP** (User Datagram Protocol) sends standalone packets with no reliability guarantees. No handshake, no retransmits, no ordering. You get speed and simplicity, at the cost of "the packet might just not arrive". Useful for real-time voice, video, and games, where a late packet is useless anyway.

Most web traffic uses TCP. Live video calls and DNS use UDP.

## HTTP

**HTTP** (HyperText Transfer Protocol) is what browsers and servers speak. It's an application-layer protocol on top of TCP.

A simple HTTP exchange:

```
GET /index.html HTTP/1.1
Host: example.com

HTTP/1.1 200 OK
Content-Type: text/html

<html>...</html>
```

The client sends a *request*; the server sends a *response*. **HTTPS** is HTTP wrapped in TLS encryption, same protocol, encrypted in transit.

## DNS

You typed `landmark.app` into your browser, but the network needs an IP address. **DNS** (Domain Name System) is the world's phone book: a hierarchical, distributed lookup service that translates names into IPs.

```
landmark.app  →  76.76.21.21
```

DNS lookups themselves use UDP by default (small, fast, occasional retry is fine), with a fallback to TCP for large responses.

## Common pitfalls

- **Confusing TCP and HTTP.** TCP is the transport; HTTP is one of many protocols built on top of it. Knowing where a problem lives in the stack is half the battle in debugging.
- **Assuming localhost = the internet.** Code that works against `localhost` can break on a real network because of latency, partial failures, firewalls, and TCP congestion behaviour you never saw locally.
- **Forgetting DNS caching.** When DNS records change, clients can hold the old value for hours depending on TTL. Test propagation explicitly.

---

_Adapted from [Wikipedia](https://en.wikipedia.org/wiki/Internet_protocol_suite) (CC BY-SA 4.0)._
